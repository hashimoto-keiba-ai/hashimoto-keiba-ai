from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from auto_sort import COURSE_NAMES, DOC_TYPE_DIRS, detect_course, detect_doc_type, detect_year, parse_metadata, read_markdown


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_PATH = DATA_DIR / "dashboard-data.json"

SECTION_PATTERN = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def normalize_date(value: str, fallback_file_name: str) -> str:
    if value:
        match = re.search(r"(20\d{2})[-/]?(\d{2})[-/]?(\d{2})", value)
        if match:
            return "-".join(match.groups())

    match = re.search(r"(20\d{2})(\d{2})(\d{2})", fallback_file_name)
    if match:
        return "-".join(match.groups())

    return ""


def first_value(metadata: dict[str, str], keys: list[str], fallback: str = "") -> str:
    for key in keys:
        value = metadata.get(key)
        if value:
            return value
    return fallback


def split_sections(content: str) -> dict[str, str]:
    sections: dict[str, str] = {}
    matches = list(SECTION_PATTERN.finditer(content))
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        sections[match.group(1).strip()] = content[start:end].strip()
    return sections


def first_line(value: str) -> str:
    for line in value.splitlines():
        cleaned = line.strip().lstrip("-").strip()
        if cleaned:
            return cleaned
    return ""


def number_value(value: str) -> float | None:
    match = re.search(r"-?\d+(?:,\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?", value)
    if not match:
        return None
    return float(match.group(0).replace(",", ""))


def bool_value(value: str) -> bool | None:
    cleaned = value.strip().lower()
    if cleaned in ("true", "yes", "1", "的中", "当たり", "hit"):
        return True
    if cleaned in ("false", "no", "0", "不的中", "外れ", "miss"):
        return False
    return None


def percent(numerator: float, denominator: float) -> float:
    if denominator == 0:
        return 0.0
    return round(numerator / denominator * 100, 1)


def yen(value: float | int | None) -> int:
    return int(value or 0)


def pick_number(metadata: dict[str, str], keys: list[str]) -> float:
    for key in keys:
        value = metadata.get(key)
        if value:
            parsed = number_value(value)
            if parsed is not None:
                return parsed
    return 0.0


def parse_win5_races(section: str) -> list[dict[str, str]]:
    races = []
    for line in section.splitlines():
        cleaned = line.strip().lstrip("-").strip()
        if not cleaned:
            continue
        parts = [part.strip() for part in cleaned.split("|")]
        race = {"label": parts[0], "favorite": "", "backup": "", "longshot": "", "zone": ""}
        for part in parts[1:]:
            if ":" not in part:
                continue
            key, value = [item.strip() for item in part.split(":", 1)]
            if key in ("本命", "軸", "候補"):
                race["favorite"] = value
            elif key in ("押さえ", "相手"):
                race["backup"] = value
            elif key in ("穴", "神穴"):
                race["longshot"] = value
            elif key in ("ゾーン", "Zone", "zone"):
                race["zone"] = value
        races.append(race)
    return races


def build_group_summary(items: list[dict[str, Any]], key: str) -> list[dict[str, Any]]:
    groups: dict[str, dict[str, Any]] = {}
    for item in items:
        label = item.get(key) or "未設定"
        group = groups.setdefault(label, {"label": label, "investment": 0, "payout": 0, "hits": 0, "raceCount": 0})
        group["investment"] += item["investment"]
        group["payout"] += item["payout"]
        group["hits"] += 1 if item["hit"] else 0
        group["raceCount"] += 1

    summaries = []
    for group in groups.values():
        summaries.append(
            {
                **group,
                "roi": percent(group["payout"], group["investment"]),
                "hitRate": percent(group["hits"], group["raceCount"]),
            }
        )
    return sorted(summaries, key=lambda item: item["roi"], reverse=True)


def build_monthly_summary(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    monthly_items = [{**item, "month": item["date"][:7] if item.get("date") else "未設定"} for item in items]
    return build_group_summary(monthly_items, "month")


def build_log_entry(path: Path) -> dict[str, Any] | None:
    content = read_markdown(path)
    metadata = parse_metadata(content)
    course = detect_course(content, path.name)
    doc_type = detect_doc_type(content, path.name)

    if doc_type == "WIN5" and not course:
        course = "WIN5"

    if not course or not doc_type:
        return None

    stat = path.stat()
    sections = split_sections(content)
    race_number = first_value(metadata, ["レース番号", "R", "race"], "")
    date_value = normalize_date(first_value(metadata, ["日付", "date"], ""), path.name)

    return {
        "title": first_value(metadata, ["レース名", "タイトル", "title"], path.stem),
        "course": course,
        "year": detect_year(content, path.name),
        "type": doc_type,
        "category": DOC_TYPE_DIRS.get(doc_type, ""),
        "race": race_number,
        "date": date_value,
        "file": str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "updatedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        "summary": first_line(first_value(metadata, ["概要", "summary"], "") or first_line(sections.get("総括", "") or sections.get("注意点", ""))),
        "metadata": metadata,
        "sections": sections,
    }


def markdown_files() -> list[Path]:
    files: list[Path] = []
    for course_name in [*COURSE_NAMES, "WIN5", "WIN５"]:
        course_dir = PROJECT_ROOT / course_name
        if not course_dir.exists():
            continue
        files.extend(path for path in course_dir.rglob("*.md") if path.is_file() and path.name.lower() != "readme.md")
    return sorted(files)


def build_race_monitor(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    races = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue
        metadata = entry["metadata"]
        sections = entry["sections"]
        races.append(
            {
                "course": entry["course"],
                "race": entry["race"] or first_value(metadata, ["レース"], ""),
                "name": entry["title"],
                "surface": first_value(metadata, ["距離", "コース", "surface"], ""),
                "going": first_value(metadata, ["馬場", "going"], ""),
                "pace": first_value(metadata, ["展開", "pace"], first_line(sections.get("展開メモ", ""))),
                "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
                "topHorse": first_value(metadata, ["軸候補", "軸", "topHorse"], first_line(sections.get("印", ""))),
                "edge": first_value(metadata, ["AI優位差", "優位差", "edge"], ""),
                "date": entry["date"],
                "file": entry["file"],
            }
        )
    return races[:12]


def build_ai_ranking(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ranking = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue
        metadata = entry["metadata"]
        score = number_value(first_value(metadata, ["AI指数", "指数", "score"], ""))
        horse = first_value(metadata, ["馬名", "軸候補", "軸", "topHorse"], "")
        if not score or not horse:
            continue
        ranking.append(
            {
                "horse": horse,
                "race": f"{entry['course'].replace('競馬場', '')}{entry['race']}",
                "score": score,
                "value": number_value(first_value(metadata, ["期待値", "value"], "")),
                "course": entry["course"],
                "date": entry["date"],
                "file": entry["file"],
            }
        )

    ranking.sort(key=lambda item: item["score"], reverse=True)
    for index, item in enumerate(ranking, start=1):
        item["rank"] = index
    return ranking[:20]


def ai_index_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue
        metadata = entry["metadata"]
        score = number_value(first_value(metadata, ["AI指数", "指数", "score"], ""))
        horse = first_value(metadata, ["馬名", "軸候補", "軸", "topHorse"], "")
        if score is None or not horse:
            continue
        items.append(
            {
                "horse": horse,
                "score": score,
                "course": entry["course"],
                "race": f"{entry['course'].replace('競馬場', '')}{entry['race']}",
                "raceName": entry["title"],
                "date": entry["date"],
                "popularity": number_value(first_value(metadata, ["人気", "想定人気", "popularity"], "")),
                "odds": number_value(first_value(metadata, ["単勝オッズ", "単勝", "odds"], "")),
                "expectedValue": number_value(first_value(metadata, ["期待値", "value", "expectedValue"], "")),
                "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
                "file": entry["file"],
            }
        )
    return items


def build_ai_index_summary(entries: list[dict[str, Any]]) -> dict[str, Any]:
    items = ai_index_entries(entries)
    if not items:
        return {
            "entryCount": 0,
            "averageScore": 0.0,
            "topScore": 0.0,
            "byCourse": [],
            "topHorses": [],
        }

    by_course: dict[str, dict[str, Any]] = {}
    for item in items:
        group = by_course.setdefault(item["course"], {"course": item["course"], "entryCount": 0, "scoreTotal": 0.0, "topScore": 0.0})
        group["entryCount"] += 1
        group["scoreTotal"] += item["score"]
        group["topScore"] = max(group["topScore"], item["score"])

    course_summary = [
        {
            "course": group["course"],
            "entryCount": group["entryCount"],
            "averageScore": round(group["scoreTotal"] / group["entryCount"], 1),
            "topScore": round(group["topScore"], 1),
        }
        for group in by_course.values()
    ]
    course_summary.sort(key=lambda item: (item["averageScore"], item["topScore"]), reverse=True)

    top_horses = sorted(items, key=lambda item: item["score"], reverse=True)[:10]
    for index, item in enumerate(top_horses, start=1):
        item["rank"] = index
        item["score"] = round(item["score"], 1)

    return {
        "entryCount": len(items),
        "averageScore": round(sum(item["score"] for item in items) / len(items), 1),
        "topScore": round(max(item["score"] for item in items), 1),
        "byCourse": course_summary,
        "topHorses": top_horses,
    }


def build_course_memos(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    memos = []
    for entry in entries:
        memo = entry["sections"].get("馬場・展開メモ") or entry["sections"].get("展開メモ") or entry["metadata"].get("展開メモ", "")
        if not memo:
            continue
        memos.append(
            {
                "course": entry["course"],
                "date": entry["date"],
                "type": entry["type"],
                "memo": first_line(memo),
                "file": entry["file"],
            }
        )
    return memos[:20]


def build_roi_monitor(entries: list[dict[str, Any]]) -> dict[str, Any]:
    result_entries = []
    for entry in entries:
        if entry["type"] != "結果検証":
            continue
        metadata = entry["metadata"]
        investment = yen(pick_number(metadata, ["投資額", "購入額", "betAmount", "investment"]))
        payout = yen(pick_number(metadata, ["払戻額", "回収額", "payout", "return"]))
        hit = bool_value(first_value(metadata, ["的中", "hit"], ""))
        if hit is None:
            hit = payout > 0
        result_entries.append(
            {
                "date": entry["date"],
                "course": entry["course"],
                "race": entry["race"],
                "title": entry["title"],
                "ticketType": first_value(metadata, ["券種", "ticketType"], "未設定"),
                "investment": investment,
                "payout": payout,
                "hit": hit,
                "file": entry["file"],
            }
        )

    total_investment = sum(item["investment"] for item in result_entries)
    total_payout = sum(item["payout"] for item in result_entries)
    hit_count = sum(1 for item in result_entries if item["hit"])
    race_count = len(result_entries)

    return {
        "totalInvestment": total_investment,
        "totalPayout": total_payout,
        "profit": total_payout - total_investment,
        "roi": percent(total_payout, total_investment),
        "hitRate": percent(hit_count, race_count),
        "raceCount": race_count,
        "hitCount": hit_count,
        "byCourse": build_group_summary(result_entries, "course"),
        "byTicketType": build_group_summary(result_entries, "ticketType"),
        "monthly": build_monthly_summary(result_entries),
        "recent": result_entries[:12],
    }


def build_divine_race_ranking(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ranking = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue
        metadata = entry["metadata"]
        divine_score = pick_number(metadata, ["神レース指数", "神指数", "divineScore"])
        expected_value = pick_number(metadata, ["期待値", "EV", "expectedValue"])
        if divine_score <= 0 and expected_value <= 0:
            continue
        ranking.append(
            {
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "divineScore": divine_score,
                "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
                "expectedValue": expected_value,
                "recommendedStake": yen(pick_number(metadata, ["推奨投資額", "推奨額", "recommendedStake"])),
                "reason": first_value(metadata, ["神レース理由", "理由", "reason"], first_line(entry["sections"].get("神レース理由", ""))),
                "date": entry["date"],
                "file": entry["file"],
            }
        )

    ranking.sort(key=lambda item: (item["divineScore"], item["expectedValue"]), reverse=True)
    for index, item in enumerate(ranking, start=1):
        item["rank"] = index
    return ranking[:20]


def confidence_points(value: str) -> int:
    normalized = value.strip().upper()
    if normalized.startswith("S"):
        return 12
    if normalized.startswith("A"):
        return 10
    if normalized.startswith("B"):
        return 6
    if normalized.startswith("C"):
        return 2
    return 0


def build_auto_divine_races(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    races = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue

        metadata = entry["metadata"]
        ai_score = pick_number(metadata, ["AI指数", "指数", "score"])
        expected_value = pick_number(metadata, ["期待値", "EV", "expectedValue"])
        confidence = first_value(metadata, ["信頼度", "confidence"], "")
        risky_count = yen(pick_number(metadata, ["危険人気馬数", "危険馬数", "riskyFavoriteCount"]))
        longshot_count = yen(pick_number(metadata, ["爆穴候補数", "穴候補数", "longshotCount"]))
        recommended_stake = yen(pick_number(metadata, ["推奨投資額", "推奨額", "recommendedStake"]))

        auto_score = min(
            100,
            round(
                ai_score * 0.55
                + min(expected_value, 200) * 0.16
                + confidence_points(confidence)
                + min(risky_count, 3) * 4
                + min(longshot_count, 3) * 3
                + (4 if recommended_stake > 0 else 0)
            ),
        )
        if auto_score < 70:
            continue

        reasons = []
        if ai_score >= 88:
            reasons.append("AI指数が高い")
        if expected_value >= 120:
            reasons.append("期待値が高い")
        if confidence_points(confidence) >= 10:
            reasons.append("信頼度が高い")
        if risky_count > 0:
            reasons.append("危険人気馬あり")
        if longshot_count > 0:
            reasons.append("爆穴候補あり")
        if recommended_stake > 0:
            reasons.append("推奨投資額あり")

        races.append(
            {
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "autoScore": auto_score,
                "aiScore": round(ai_score, 1),
                "confidence": confidence,
                "expectedValue": expected_value,
                "recommendedStake": recommended_stake,
                "reasons": reasons,
                "date": entry["date"],
                "file": entry["file"],
            }
        )

    races.sort(key=lambda item: (item["autoScore"], item["expectedValue"], item["aiScore"]), reverse=True)
    for index, item in enumerate(races, start=1):
        item["rank"] = index
    return races[:20]


def win5_zone(metadata: dict[str, str], ai_score: float, expected_value: float, confidence: str) -> str:
    zone = first_value(metadata, ["WIN5ゾーン", "ゾーン", "zone"], "").upper()
    if zone in ("A", "B", "C"):
        return zone
    if ai_score >= 90 and confidence_points(confidence) >= 10:
        return "A"
    if ai_score >= 84 or expected_value >= 120:
        return "B"
    return "C"


def is_win5_candidate(metadata: dict[str, str], ai_score: float, expected_value: float, confidence: str) -> bool:
    target = bool_value(first_value(metadata, ["WIN5対象", "WIN5候補", "win5Target"], ""))
    if target is not None:
        return target
    if first_value(metadata, ["WIN5ゾーン", "ゾーン", "zone"], ""):
        return True
    return ai_score >= 88 and confidence_points(confidence) >= 10 and expected_value >= 100


def build_auto_win5_candidates(entries: list[dict[str, Any]]) -> dict[str, Any]:
    grouped: dict[str, dict[str, Any]] = {}
    for entry in entries:
        if entry["type"] != "事前予想":
            continue

        metadata = entry["metadata"]
        horse = first_value(metadata, ["馬名", "軸候補", "軸", "topHorse"], "")
        ai_score = pick_number(metadata, ["AI指数", "指数", "score"])
        expected_value = pick_number(metadata, ["期待値", "EV", "expectedValue"])
        confidence = first_value(metadata, ["信頼度", "confidence"], "")
        if not horse or not is_win5_candidate(metadata, ai_score, expected_value, confidence):
            continue

        label = f"{entry['course'].replace('競馬場', '')}{entry['race']}"
        group = grouped.setdefault(
            label,
            {
                "label": label,
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "date": entry["date"],
                "candidates": [],
            },
        )
        group["candidates"].append(
            {
                "horse": horse,
                "zone": win5_zone(metadata, ai_score, expected_value, confidence),
                "aiScore": round(ai_score, 1),
                "confidence": confidence,
                "expectedValue": expected_value,
                "file": entry["file"],
            }
        )

    races = list(grouped.values())
    for race in races:
        race["candidates"].sort(key=lambda item: (item["zone"] != "A", -item["aiScore"], -(item["expectedValue"] or 0)))

    races.sort(key=lambda item: max((candidate["aiScore"] for candidate in item["candidates"]), default=0), reverse=True)
    races = races[:5]
    combination_count = 1
    for race in races:
        combination_count *= max(1, len(race["candidates"]))

    return {
        "raceCount": len(races),
        "combinationCount": combination_count if races else 0,
        "estimatedInvestment": combination_count * 100 if races else 0,
        "races": races,
    }


def popularity_zone(value: float | None) -> str:
    if value is None or value <= 0:
        return "未設定"
    if value <= 3:
        return "上位人気"
    if value <= 6:
        return "中位人気"
    if value <= 9:
        return "伏兵"
    return "大穴"


def build_risky_favorite_ranking(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ranking = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue

        metadata = entry["metadata"]
        horse = first_value(metadata, ["危険人気馬", "危険馬", "riskyFavorite"], "")
        risk_score = pick_number(metadata, ["危険度", "危険度スコア", "riskScore"])
        if not horse or risk_score <= 0:
            continue

        popularity = number_value(first_value(metadata, ["危険人気馬人気", "人気", "想定人気", "popularity"], ""))
        ranking.append(
            {
                "horse": horse,
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "riskScore": round(risk_score, 1),
                "popularity": popularity,
                "popularityZone": first_value(metadata, ["人気ゾーン", "危険人気ゾーン"], popularity_zone(popularity)),
                "reason": first_value(metadata, ["危険理由", "理由", "riskReason"], first_line(entry["sections"].get("危険人気馬", ""))),
                "date": entry["date"],
                "file": entry["file"],
            }
        )

    ranking.sort(key=lambda item: item["riskScore"], reverse=True)
    for index, item in enumerate(ranking, start=1):
        item["rank"] = index
    return ranking[:20]


def build_longshot_ranking(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    ranking = []
    for entry in entries:
        if entry["type"] != "事前予想":
            continue

        metadata = entry["metadata"]
        horse = first_value(metadata, ["爆穴馬", "爆穴", "穴馬", "longshot"], "")
        longshot_score = pick_number(metadata, ["爆穴指数", "穴指数", "longshotScore"])
        expected_value = pick_number(metadata, ["爆穴期待値", "期待値", "expectedValue"])
        if not horse or longshot_score <= 0:
            continue

        popularity = number_value(first_value(metadata, ["爆穴人気", "人気", "想定人気", "popularity"], ""))
        ranking.append(
            {
                "horse": horse,
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "longshotScore": round(longshot_score, 1),
                "popularity": popularity,
                "popularityZone": first_value(metadata, ["人気ゾーン", "爆穴人気ゾーン"], popularity_zone(popularity)),
                "expectedValue": expected_value,
                "ticket": first_value(metadata, ["買い目", "推奨買い目", "ticket"], ""),
                "reason": first_value(metadata, ["爆穴理由", "推奨理由", "longshotReason"], first_line(entry["sections"].get("爆穴理由", ""))),
                "date": entry["date"],
                "file": entry["file"],
            }
        )

    ranking.sort(key=lambda item: (item["longshotScore"], item["expectedValue"]), reverse=True)
    for index, item in enumerate(ranking, start=1):
        item["rank"] = index
    return ranking[:20]


def build_win5_dashboard(entries: list[dict[str, Any]]) -> dict[str, Any]:
    win5_entries = [entry for entry in entries if entry["type"] == "WIN5"]
    if not win5_entries:
        return {
            "date": "",
            "investment": 0,
            "targetPayout": 0,
            "confidence": "",
            "combinationCount": 0,
            "races": [],
            "file": "",
        }

    entry = win5_entries[0]
    metadata = entry["metadata"]
    races = parse_win5_races(entry["sections"].get("WIN5レース", "") or entry["sections"].get("対象レース", ""))
    return {
        "date": entry["date"],
        "investment": yen(pick_number(metadata, ["想定投資額", "投資額", "investment"])),
        "targetPayout": yen(pick_number(metadata, ["回収目標", "目標払戻", "targetPayout"])),
        "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
        "combinationCount": yen(pick_number(metadata, ["組み合わせ数", "点数", "combinationCount"])),
        "races": races,
        "file": entry["file"],
    }


def build_ai_overall_dashboard(entries: list[dict[str, Any]]) -> dict[str, Any]:
    ai_summary = build_ai_index_summary(entries)
    auto_divine = build_auto_divine_races(entries)
    auto_win5 = build_auto_win5_candidates(entries)
    risky = build_risky_favorite_ranking(entries)
    longshots = build_longshot_ranking(entries)

    return {
        "aiIndex": {
            "entryCount": ai_summary["entryCount"],
            "averageScore": ai_summary["averageScore"],
            "topScore": ai_summary["topScore"],
            "topHorse": ai_summary["topHorses"][0] if ai_summary["topHorses"] else None,
        },
        "autoDivine": {
            "candidateCount": len(auto_divine),
            "topRace": auto_divine[0] if auto_divine else None,
        },
        "autoWin5": {
            "raceCount": auto_win5["raceCount"],
            "combinationCount": auto_win5["combinationCount"],
            "estimatedInvestment": auto_win5["estimatedInvestment"],
        },
        "risk": {
            "candidateCount": len(risky),
            "topHorse": risky[0] if risky else None,
        },
        "longshot": {
            "candidateCount": len(longshots),
            "topHorse": longshots[0] if longshots else None,
        },
    }


def generate_dashboard_data() -> dict[str, Any]:
    entries = [entry for path in markdown_files() if (entry := build_log_entry(path))]
    entries.sort(key=lambda item: (item["date"], item["updatedAt"]), reverse=True)
    ai_index_summary = build_ai_index_summary(entries)
    auto_divine_races = build_auto_divine_races(entries)
    auto_win5_candidates = build_auto_win5_candidates(entries)
    risky_favorite_ranking = build_risky_favorite_ranking(entries)
    longshot_ranking = build_longshot_ranking(entries)

    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "markdown",
        "latestLogs": [
            {
                "title": entry["title"],
                "course": entry["course"],
                "type": entry["type"],
                "race": entry["race"],
                "date": entry["date"],
                "summary": entry["summary"],
                "file": entry["file"],
            }
            for entry in entries[:30]
        ],
        "races": build_race_monitor(entries),
        "aiRanking": build_ai_ranking(entries),
        "aiIndexSummary": ai_index_summary,
        "courseMemos": build_course_memos(entries),
        "roiMonitor": build_roi_monitor(entries),
        "divineRaceRanking": build_divine_race_ranking(entries),
        "autoDivineRaces": auto_divine_races,
        "autoWin5Candidates": auto_win5_candidates,
        "riskyFavoriteRanking": risky_favorite_ranking,
        "longshotRanking": longshot_ranking,
        "aiOverallDashboard": {
            "aiIndex": {
                "entryCount": ai_index_summary["entryCount"],
                "averageScore": ai_index_summary["averageScore"],
                "topScore": ai_index_summary["topScore"],
                "topHorse": ai_index_summary["topHorses"][0] if ai_index_summary["topHorses"] else None,
            },
            "autoDivine": {
                "candidateCount": len(auto_divine_races),
                "topRace": auto_divine_races[0] if auto_divine_races else None,
            },
            "autoWin5": {
                "raceCount": auto_win5_candidates["raceCount"],
                "combinationCount": auto_win5_candidates["combinationCount"],
                "estimatedInvestment": auto_win5_candidates["estimatedInvestment"],
            },
            "risk": {
                "candidateCount": len(risky_favorite_ranking),
                "topHorse": risky_favorite_ranking[0] if risky_favorite_ranking else None,
            },
            "longshot": {
                "candidateCount": len(longshot_ranking),
                "topHorse": longshot_ranking[0] if longshot_ranking else None,
            },
        },
        "win5Dashboard": build_win5_dashboard(entries),
    }


def write_dashboard_data(output_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    payload = generate_dashboard_data()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"WRITE: {output_path.relative_to(PROJECT_ROOT)}")
    return payload


if __name__ == "__main__":
    write_dashboard_data()
