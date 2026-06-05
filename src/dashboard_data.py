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
WIN5_ROOT = PROJECT_ROOT / "WIN5"
LEARNING_COURSE_NAMES = [
    "福島競馬場",
    "中山競馬場",
    "阪神競馬場",
    "中京競馬場",
    "東京競馬場",
    "小倉競馬場",
    "京都競馬場",
    "新潟競馬場",
    "函館競馬場",
    "札幌競馬場",
]

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


def win5_markdown_files() -> list[Path]:
    if not WIN5_ROOT.exists():
        return []
    targets = [WIN5_ROOT / "README.md", WIN5_ROOT / "WIN5_AI.md"]
    for folder_name in ("対象レース", "買い目", "結果検証"):
        folder = WIN5_ROOT / folder_name
        if folder.exists():
            targets.extend(folder.glob("*.md"))
    return sorted(path for path in targets if path.exists() and path.is_file())


def racecourse_markdown_files() -> list[Path]:
    files: list[Path] = []
    for course_name in LEARNING_COURSE_NAMES:
        course_dir = PROJECT_ROOT / course_name
        if not course_dir.exists():
            continue
        files.extend(path for path in course_dir.rglob("*.md") if path.is_file())
    return sorted(files)


def racecourse_source_record(path: Path) -> dict[str, Any]:
    content = read_markdown(path)
    metadata = parse_metadata(content)
    sections = split_sections(content)
    title_match = re.search(r"^#\s+(.+?)\s*$", content, re.MULTILINE)
    stat = path.stat()
    entry = build_log_entry(path)
    course = entry["course"] if entry else detect_course(content, path.name)
    doc_type = entry["type"] if entry else detect_doc_type(content, path.name)
    hit_value = bool_value(first_value(metadata, ["的中", "hit", "result"], ""))
    investment = yen(pick_number(metadata, ["投資額", "購入額", "investment"]))
    payout = yen(pick_number(metadata, ["払戻", "払戻金", "payout"]))
    popularity = number_value(first_value(metadata, ["人気", "想定人気", "popularity"], ""))
    relative_parts = path.relative_to(PROJECT_ROOT).parts
    return {
        "file": str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "course": course or (relative_parts[0] if relative_parts else ""),
        "year": detect_year(content, path.name),
        "date": normalize_date(first_value(metadata, ["日付", "date", "開催日"], ""), path.name),
        "race": first_value(metadata, ["レース番号", "R", "race"], ""),
        "title": first_value(metadata, ["レース名", "タイトル", "title"], title_match.group(1).strip() if title_match else path.stem),
        "type": doc_type or "メモ",
        "category": DOC_TYPE_DIRS.get(doc_type or "", "学習メモ"),
        "summary": first_line(first_value(metadata, ["概要", "summary"], "") or first_line(sections.get("総括", "") or sections.get("用途", "")) or content),
        "updatedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        "aiScore": number_value(first_value(metadata, ["AI指数", "指数", "score"], "")),
        "horse": first_value(metadata, ["馬名", "軸候補", "軸", "topHorse"], ""),
        "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
        "expectedValue": number_value(first_value(metadata, ["期待値", "value", "expectedValue"], "")),
        "popularity": popularity,
        "popularityZone": first_value(metadata, ["人気ゾーン", "ゾーン"], popularity_zone(popularity)),
        "hit": hit_value,
        "investment": investment,
        "payout": payout,
        "roi": percent(payout, investment),
        "metadata": metadata,
        "sections": sections,
    }


def build_racecourse_learning_database(entries: list[dict[str, Any]]) -> dict[str, Any]:
    source_records = [racecourse_source_record(path) for path in racecourse_markdown_files()]
    missing_courses = [course for course in LEARNING_COURSE_NAMES if not (PROJECT_ROOT / course).exists()]
    prediction_records = [record for record in source_records if record["type"] == "事前予想"]
    result_reviews = [record for record in source_records if record["type"] == "結果検証"]
    learning_signals = [
        record
        for record in source_records
        if record["type"] in ("保存ログ", "OSアップデート", "メモ") or record["category"] in ("保存ログ", "OSアップデート", "学習メモ")
    ]
    hit_count = sum(1 for record in result_reviews if record["hit"])
    total_investment = sum(record["investment"] for record in result_reviews)
    total_payout = sum(record["payout"] for record in result_reviews)
    courses = []
    for course_name in LEARNING_COURSE_NAMES:
        course_records = [record for record in source_records if record["course"] == course_name or record["file"].startswith(f"{course_name}/")]
        course_results = [record for record in course_records if record["type"] == "結果検証"]
        course_investment = sum(record["investment"] for record in course_results)
        course_payout = sum(record["payout"] for record in course_results)
        courses.append(
            {
                "course": course_name,
                "exists": (PROJECT_ROOT / course_name).exists(),
                "sourceFileCount": len(course_records),
                "predictionCount": sum(1 for record in course_records if record["type"] == "事前予想"),
                "resultReviewCount": len(course_results),
                "hitCount": sum(1 for record in course_results if record["hit"]),
                "investment": course_investment,
                "payout": course_payout,
                "roi": percent(course_payout, course_investment),
                "hitRate": percent(sum(1 for record in course_results if record["hit"]), len(course_results)),
                "latestUpdatedAt": max((record["updatedAt"] for record in course_records), default=""),
            }
        )

    return {
        "summary": {
            "courseCount": len([course for course in courses if course["exists"]]),
            "missingCourseCount": len(missing_courses),
            "sourceFileCount": len(source_records),
            "predictionCount": len(prediction_records),
            "resultReviewCount": len(result_reviews),
            "hitCount": hit_count,
            "totalInvestment": total_investment,
            "totalPayout": total_payout,
            "overallRoi": percent(total_payout, total_investment),
        },
        "missingCourses": missing_courses,
        "courses": courses,
        "sourceFiles": [
            {
                "file": record["file"],
                "course": record["course"],
                "type": record["type"],
                "title": record["title"],
                "summary": record["summary"],
                "updatedAt": record["updatedAt"],
            }
            for record in source_records
        ],
        "predictionRecords": prediction_records,
        "resultReviews": result_reviews,
        "learningSignals": learning_signals,
        "win5Link": {
            "source": "win5LearningDatabase",
            "role": "複数競馬場を横断するWIN5学習データとして連携",
        },
    }


def build_racecourse_pattern_analysis(learning_database: dict[str, Any], win5_pattern_analysis: dict[str, Any]) -> dict[str, Any]:
    courses = learning_database["courses"]
    active_courses = [course for course in courses if course["resultReviewCount"] > 0]
    strong_course = max(active_courses, key=lambda item: (item["roi"], item["hitRate"]), default={})
    weak_course = min(active_courses, key=lambda item: (item["roi"], item["hitRate"]), default={})
    result_reviews = learning_database["resultReviews"]
    hit_count = sum(1 for record in result_reviews if record["hit"])
    total_investment = sum(record["investment"] for record in result_reviews)
    total_payout = sum(record["payout"] for record in result_reviews)
    zone_groups: dict[str, dict[str, Any]] = {}
    for record in learning_database["predictionRecords"] + result_reviews:
        zone = record.get("popularityZone") or "未分類"
        group = zone_groups.setdefault(zone, {"zone": zone, "appearanceCount": 0, "hitCount": 0, "payout": 0})
        group["appearanceCount"] += 1
        group["hitCount"] += 1 if record.get("hit") else 0
        group["payout"] += record.get("payout") or 0

    by_popularity_zone = [
        {**group, "hitRate": percent(group["hitCount"], group["appearanceCount"])}
        for group in zone_groups.values()
    ]
    high_payout_patterns = [
        {
            "course": record["course"],
            "date": record["date"],
            "title": record["title"],
            "payout": record["payout"],
            "popularityZone": record["popularityZone"],
            "file": record["file"],
        }
        for record in sorted(result_reviews, key=lambda item: item["payout"], reverse=True)
        if record["payout"] >= 100_000
    ][:10]
    miss_patterns = [
        {
            "course": record["course"],
            "date": record["date"],
            "title": record["title"],
            "popularityZone": record["popularityZone"],
            "file": record["file"],
        }
        for record in result_reviews
        if record["hit"] is False
    ][:10]
    course_weights = {
        course["course"]: round(1 + min(course["roi"], 200) / 1000 + min(course["hitRate"], 100) / 500, 2)
        for course in courses
        if course["exists"]
    }
    popularity_zone_weights = {
        group["zone"]: round(1 + min(group["hitRate"], 100) / 500, 2)
        for group in by_popularity_zone
    }
    notes = ["競馬場別の回収率と的中率を次回予想の補助重みに利用します"]
    if win5_pattern_analysis["summary"]["resultReviewCount"] > 0:
        notes.append("WIN5人気ゾーン解析を横断レースのA/B/C/D補正に接続します")
    return {
        "summary": {
            "analyzedCourseCount": len([course for course in courses if course["sourceFileCount"] > 0]),
            "strongCourse": strong_course.get("course", ""),
            "weakCourse": weak_course.get("course", ""),
            "overallHitRate": percent(hit_count, len(result_reviews)),
            "overallRoi": percent(total_payout, total_investment),
        },
        "byCourse": courses,
        "byPopularityZone": sorted(by_popularity_zone, key=lambda item: item["appearanceCount"], reverse=True),
        "highPayoutPatterns": high_payout_patterns,
        "missPatterns": miss_patterns,
        "reflectionPolicy": {
            "courseWeights": course_weights,
            "popularityZoneWeights": popularity_zone_weights,
            "win5ZoneWeights": win5_pattern_analysis["reflectionPolicy"],
            "notes": notes,
        },
    }


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


def win5_source_category(path: Path) -> str:
    relative_parts = path.relative_to(WIN5_ROOT).parts
    if path.name == "WIN5_AI.md":
        return "aiNotes"
    if relative_parts[0] == "対象レース":
        return "targetRace"
    if relative_parts[0] == "買い目":
        return "ticketPlan"
    if relative_parts[0] == "結果検証":
        return "resultReview"
    return "overview"


def win5_source_record(path: Path) -> dict[str, Any]:
    content = read_markdown(path)
    metadata = parse_metadata(content)
    sections = split_sections(content)
    title_match = re.search(r"^#\s+(.+?)\s*$", content, re.MULTILINE)
    stat = path.stat()
    return {
        "file": str(path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "category": win5_source_category(path),
        "title": first_value(metadata, ["タイトル", "title"], title_match.group(1).strip() if title_match else path.stem),
        "date": normalize_date(first_value(metadata, ["日付", "date", "開催日"], ""), path.name),
        "updatedAt": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
        "metadata": metadata,
        "sections": sections,
        "content": content,
        "summary": first_line(first_value(metadata, ["概要", "summary"], "") or first_line(sections.get("用途", "")) or content),
    }


def build_win5_learning_database() -> dict[str, Any]:
    sources = [win5_source_record(path) for path in win5_markdown_files()]
    target_races = [source for source in sources if source["category"] == "targetRace"]
    ticket_plans = [source for source in sources if source["category"] == "ticketPlan"]
    result_reviews = [source for source in sources if source["category"] == "resultReview"]
    ai_notes = [source for source in sources if source["category"] in ("aiNotes", "overview")]
    return {
        "summary": {
            "sourceFileCount": len(sources),
            "targetRaceCount": len(target_races),
            "ticketPlanCount": len(ticket_plans),
            "resultReviewCount": len(result_reviews),
            "aiNoteCount": len(ai_notes),
        },
        "sourceFiles": [
            {
                "file": source["file"],
                "category": source["category"],
                "title": source["title"],
                "summary": source["summary"],
                "updatedAt": source["updatedAt"],
            }
            for source in sources
        ],
        "targetRaces": target_races,
        "ticketPlans": ticket_plans,
        "resultReviews": result_reviews,
        "aiNotes": ai_notes,
    }


def classify_win5_zone_text(value: str) -> str:
    upper = value.upper()
    if "Aゾーン" in value or "A_ZONE" in upper or "ZONE A" in upper:
        return "A"
    if "Bゾーン" in value or "B_ZONE" in upper or "ZONE B" in upper:
        return "B"
    if "Cゾーン" in value or "C_ZONE" in upper or "ZONE C" in upper:
        return "C"
    if "Dゾーン" in value or "D_ZONE" in upper or "ZONE D" in upper or "想定外" in value:
        return "D"
    return ""


def win5_result_review_item(source: dict[str, Any]) -> dict[str, Any]:
    metadata = source["metadata"]
    content = source["content"]
    hit_value = bool_value(first_value(metadata, ["的中", "hit", "result"], ""))
    if hit_value is None:
        hit_value = "不的中" not in content and ("的中" in content or "当たり" in content)
    payout = yen(pick_number(metadata, ["払戻", "払戻金", "payout"]))
    if payout == 0:
        payout = yen(number_value(content) if ("払戻" in content or "配当" in content) else 0)
    investment = yen(pick_number(metadata, ["投資額", "購入額", "investment"]))
    zone_text = first_value(metadata, ["人気ゾーン", "ゾーン", "zone"], content)
    return {
        "file": source["file"],
        "title": source["title"],
        "date": source["date"],
        "hit": bool(hit_value),
        "payout": payout,
        "investment": investment,
        "roi": percent(payout, investment),
        "zone": classify_win5_zone_text(zone_text),
        "missReason": first_value(metadata, ["不的中理由", "missReason"], first_line(source["sections"].get("不的中理由", ""))),
        "improvement": first_value(metadata, ["次回改善点", "改善点", "improvement"], first_line(source["sections"].get("次回改善点", ""))),
    }


def count_win5_zone_appearances(sources: list[dict[str, Any]]) -> dict[str, int]:
    counts = {zone: 0 for zone in ("A", "B", "C", "D")}
    for source in sources:
        text = f"{source['content']}\n{' '.join(source['metadata'].values())}"
        for zone in counts:
            if f"{zone}ゾーン" in text or f"Zone {zone}" in text or f"ZONE {zone}" in text.upper():
                counts[zone] += 1
        if "想定外" in text:
            counts["D"] += 1
    return counts


def build_win5_pattern_analysis(learning_database: dict[str, Any]) -> dict[str, Any]:
    sources = learning_database["targetRaces"] + learning_database["ticketPlans"] + learning_database["resultReviews"] + learning_database["aiNotes"]
    result_items = [win5_result_review_item(source) for source in learning_database["resultReviews"]]
    hit_items = [item for item in result_items if item["hit"]]
    miss_items = [item for item in result_items if not item["hit"]]
    payouts = [item["payout"] for item in result_items if item["payout"] > 0]
    zone_appearances = count_win5_zone_appearances(sources)
    zone_hits = {zone: 0 for zone in ("A", "B", "C", "D")}
    for item in hit_items:
        if item["zone"] in zone_hits:
            zone_hits[item["zone"]] += 1

    zone_labels = {
        "A": "本命・対抗級",
        "B": "単穴・連下級",
        "C": "爆穴候補",
        "D": "想定外・未評価馬",
    }
    popularity_structure = {}
    for zone in ("A", "B", "C", "D"):
        popularity_structure[f"{zone.lower()}Zone"] = {
            "label": zone,
            "definition": zone_labels[zone],
            "appearanceCount": zone_appearances[zone],
            "hitCount": zone_hits[zone],
            "hitRate": percent(zone_hits[zone], zone_appearances[zone]),
        }

    high_payout_patterns = [
        {
            "title": item["title"],
            "date": item["date"],
            "payout": item["payout"],
            "zone": item["zone"] or "未分類",
            "file": item["file"],
        }
        for item in sorted(result_items, key=lambda row: row["payout"], reverse=True)
        if item["payout"] >= 1_000_000
    ][:10]

    c_or_d_count = popularity_structure["cZone"]["appearanceCount"] + popularity_structure["dZone"]["appearanceCount"]
    notes = []
    if c_or_d_count > 0:
        notes.append("高配当検出時はC/Dゾーン候補をWIN5の押さえに残す")
    if miss_items:
        notes.append("不的中レビューの不足ゾーンを次回候補生成で確認する")
    if not notes:
        notes.append("結果検証Markdownが増えると人気ゾーン別の反映方針を自動更新します")

    return {
        "summary": {
            "analyzedRaceCount": learning_database["summary"]["targetRaceCount"],
            "ticketPlanCount": learning_database["summary"]["ticketPlanCount"],
            "resultReviewCount": len(result_items),
            "hitCount": len(hit_items),
            "missCount": len(miss_items),
            "totalPayout": sum(payouts),
            "averagePayout": round(sum(payouts) / len(payouts), 1) if payouts else 0,
            "maxPayout": max(payouts) if payouts else 0,
        },
        "popularityZoneStructure": popularity_structure,
        "highPayoutPatterns": high_payout_patterns,
        "hitMissPatterns": result_items[:20],
        "reflectionPolicy": {
            "aZoneWeight": 1.0,
            "bZoneWeight": 1.05 if popularity_structure["bZone"]["appearanceCount"] else 1.0,
            "cZoneWeight": 1.15 if popularity_structure["cZone"]["appearanceCount"] else 1.0,
            "dZoneAlert": popularity_structure["dZone"]["appearanceCount"] > 0,
            "notes": notes,
        },
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


def empty_prediction_marks() -> dict[str, Any]:
    return {
        "favorite": None,
        "rival": None,
        "third": None,
        "fringe": [],
        "riskyFavorite": None,
        "longshot": None,
        "trifectaFormation": {
            "first": [],
            "second": [],
            "third": [],
            "candidateCount": 0,
            "combinationCount": 0,
            "reason": "",
        },
        "win5Candidate": {
            "aZone": [],
            "bZone": [],
            "cZone": [],
            "recommendedCount": 0,
            "estimatedPoints": 0,
            "reason": "",
        },
    }


def build_prediction_engine() -> dict[str, Any]:
    return {
        "version": "phase4-5-win5",
        "status": "win5-enabled",
        "calculationEnabled": True,
        "description": "AI指数順の印、爆穴馬AI、三連単フォーメーションに加えてWIN5候補をA/B/Cゾーンで自動生成します。",
        "enabledFeatures": ["marks", "riskyFavorite", "longshot", "trifecta", "win5"],
        "pendingFeatures": [],
        "markLabels": {
            "favorite": "本命",
            "rival": "対抗",
            "third": "単穴",
            "fringe": "連下",
            "riskyFavorite": "危険人気馬",
            "longshot": "爆穴馬",
            "trifectaFormation": "三連単フォーメーション",
            "win5Candidate": "WIN5候補",
        },
    }


def prediction_horse(entry: dict[str, Any]) -> dict[str, Any] | None:
    metadata = entry["metadata"]
    horse = first_value(metadata, ["馬名", "軸候補", "軸", "topHorse"], "")
    ai_score = number_value(first_value(metadata, ["AI指数", "指数", "score"], ""))
    if not horse or ai_score is None:
        return None
    return {
        "horse": horse,
        "aiScore": round(ai_score, 1),
        "course": entry["course"],
        "race": entry["race"],
        "raceName": entry["title"],
        "date": entry["date"],
        "confidence": first_value(metadata, ["信頼度", "confidence"], ""),
        "expectedValue": number_value(first_value(metadata, ["期待値", "value", "expectedValue"], "")),
        "popularity": number_value(first_value(metadata, ["人気", "想定人気", "popularity"], "")),
        "riskScore": pick_number(metadata, ["危険度", "危険度スコア", "riskScore"]),
        "longshotScore": pick_number(metadata, ["爆穴指数", "穴指数", "longshotScore"]),
        "file": entry["file"],
    }


def risky_prediction_candidate(ranked: list[dict[str, Any]]) -> dict[str, Any] | None:
    candidates = []
    for index, horse in enumerate(ranked[:4], start=1):
        expected_value = horse.get("expectedValue") or 0
        confidence = horse.get("confidence") or ""
        risk_score = horse.get("riskScore") or 0
        unstable_score = risk_score + (12 - confidence_points(confidence)) * 4 + (15 if expected_value and expected_value < 95 else 0)
        if unstable_score < 20:
            continue
        reasons = []
        if risk_score > 0:
            reasons.append(f"危険度{round(risk_score, 1)}")
        if confidence_points(confidence) < 10:
            reasons.append("信頼度が不安定")
        if expected_value and expected_value < 95:
            reasons.append("期待値が低い")
        candidates.append({**horse, "markRank": index, "unstableScore": round(unstable_score, 1), "reason": " / ".join(reasons) or "AI指数上位だが評価が不安定"})

    if not candidates:
        return None
    return sorted(candidates, key=lambda item: item["unstableScore"], reverse=True)[0]


def longshot_prediction_candidate(ranked: list[dict[str, Any]]) -> dict[str, Any] | None:
    candidates = []
    for index, horse in enumerate(ranked, start=1):
        expected_value = horse.get("expectedValue") or 0
        longshot_score = horse.get("longshotScore") or 0
        popularity = horse.get("popularity")
        is_middle_or_lower = index >= 4 or (popularity is not None and popularity >= 7)
        if not is_middle_or_lower or expected_value < 120:
            continue
        score = longshot_score + expected_value * 0.25 + max(0, 12 - index)
        reasons = []
        reasons.append("AI指数中位以下")
        reasons.append(f"期待値{round(expected_value, 1)}")
        if longshot_score > 0:
            reasons.append(f"爆穴指数{round(longshot_score, 1)}")
        if popularity is not None:
            reasons.append(popularity_zone(popularity))
        candidates.append({**horse, "markRank": index, "longshotAiScore": round(score, 1), "reason": " / ".join(reasons)})

    if not candidates:
        return None
    return sorted(candidates, key=lambda item: item["longshotAiScore"], reverse=True)[0]


def unique_prediction_horses(horses: list[dict[str, Any] | None]) -> list[dict[str, Any]]:
    unique = []
    seen = set()
    for horse in horses:
        if not horse:
            continue
        name = horse.get("horse")
        if not name or name in seen:
            continue
        seen.add(name)
        unique.append(horse)
    return unique


def count_trifecta_combinations(first: list[dict[str, Any]], second: list[dict[str, Any]], third: list[dict[str, Any]]) -> int:
    count = 0
    for first_horse in first:
        for second_horse in second:
            for third_horse in third:
                names = {first_horse["horse"], second_horse["horse"], third_horse["horse"]}
                if len(names) == 3:
                    count += 1
    return count


def build_trifecta_formation(marks: dict[str, Any]) -> dict[str, Any]:
    first = unique_prediction_horses([marks.get("favorite"), marks.get("rival")])
    second = unique_prediction_horses([marks.get("favorite"), marks.get("rival"), marks.get("third")])
    third = unique_prediction_horses(
        [
            marks.get("favorite"),
            marks.get("rival"),
            marks.get("third"),
            *marks.get("fringe", []),
            marks.get("longshot"),
        ]
    )
    candidate_count = len(unique_prediction_horses([*first, *second, *third]))
    combination_count = count_trifecta_combinations(first, second, third)
    reason_parts = ["本命・対抗を1着軸", "本命・対抗・単穴を2着候補", "連下と爆穴馬まで3着に拡張"]
    if marks.get("longshot"):
        reason_parts.append(f"爆穴馬AI: {marks['longshot']['horse']}")
    return {
        "first": first,
        "second": second,
        "third": third,
        "candidateCount": candidate_count,
        "combinationCount": combination_count,
        "reason": " / ".join(reason_parts),
    }


def build_win5_candidate(marks: dict[str, Any]) -> dict[str, Any]:
    a_zone = unique_prediction_horses([marks.get("favorite"), marks.get("rival")])
    b_zone = unique_prediction_horses([marks.get("third"), *marks.get("fringe", [])])
    c_zone = unique_prediction_horses([marks.get("longshot")])
    recommended = unique_prediction_horses([*a_zone, *b_zone, *c_zone])
    reason_parts = ["Aゾーンは本命・対抗", "Bゾーンは単穴・連下", "Cゾーンは爆穴馬AI"]
    if c_zone:
        reason_parts.append(f"爆穴補強: {c_zone[0]['horse']}")
    return {
        "aZone": a_zone,
        "bZone": b_zone,
        "cZone": c_zone,
        "recommendedCount": len(recommended),
        "estimatedPoints": len(recommended),
        "reason": " / ".join(reason_parts),
    }


def build_auto_prediction(entries: list[dict[str, Any]]) -> dict[str, Any]:
    grouped: dict[str, dict[str, Any]] = {}
    for entry in entries:
        if entry["type"] != "事前予想":
            continue
        horse = prediction_horse(entry)
        if horse is None:
            continue

        key = f"{entry['course']}|{entry['race']}|{entry['title']}"
        group = grouped.setdefault(
            key,
            {
                "course": entry["course"],
                "race": entry["race"],
                "name": entry["title"],
                "date": entry["date"],
                "marks": empty_prediction_marks(),
                "rankedHorses": [],
            },
        )
        group["rankedHorses"].append(horse)

    races = []
    for group in grouped.values():
        ranked = sorted(group["rankedHorses"], key=lambda item: item["aiScore"], reverse=True)
        marks = {
            "favorite": ranked[0] if len(ranked) >= 1 else None,
            "rival": ranked[1] if len(ranked) >= 2 else None,
            "third": ranked[2] if len(ranked) >= 3 else None,
            "fringe": ranked[3:7],
            "riskyFavorite": risky_prediction_candidate(ranked),
            "longshot": longshot_prediction_candidate(ranked),
        }
        marks["trifectaFormation"] = build_trifecta_formation(marks)
        marks["win5Candidate"] = build_win5_candidate(marks)
        races.append({**group, "marks": marks, "rankedHorses": ranked})

    races.sort(key=lambda item: item["rankedHorses"][0]["aiScore"] if item["rankedHorses"] else 0, reverse=True)
    favorite_count = sum(1 for race in races if race["marks"]["favorite"])
    rival_count = sum(1 for race in races if race["marks"]["rival"])
    third_count = sum(1 for race in races if race["marks"]["third"])
    fringe_count = sum(len(race["marks"]["fringe"]) for race in races)
    risky_count = sum(1 for race in races if race["marks"]["riskyFavorite"])
    longshot_count = sum(1 for race in races if race["marks"]["longshot"])
    trifecta_count = sum(1 for race in races if race["marks"]["trifectaFormation"]["combinationCount"] > 0)
    trifecta_combination_count = sum(race["marks"]["trifectaFormation"]["combinationCount"] for race in races)
    win5_race_count = sum(1 for race in races if race["marks"]["win5Candidate"]["recommendedCount"] > 0)
    win5_recommended_count = sum(race["marks"]["win5Candidate"]["recommendedCount"] for race in races)
    win5_combination_count = 0
    for race in races:
        recommended_count = race["marks"]["win5Candidate"]["recommendedCount"]
        if recommended_count <= 0:
            continue
        win5_combination_count = recommended_count if win5_combination_count == 0 else win5_combination_count * recommended_count

    return {
        "summary": {
            "raceCount": len(races),
            "favoriteCount": favorite_count,
            "rivalCount": rival_count,
            "thirdCount": third_count,
            "fringeCount": fringe_count,
            "riskyFavoriteCount": risky_count,
            "longshotCount": longshot_count,
            "trifectaFormationCount": trifecta_count,
            "trifectaCombinationCount": trifecta_combination_count,
            "win5RaceCount": win5_race_count,
            "win5RecommendedHorseCount": win5_recommended_count,
            "win5CombinationCount": win5_combination_count,
        },
        "races": races,
        "emptyMarks": empty_prediction_marks(),
    }


def generate_dashboard_data() -> dict[str, Any]:
    entries = [entry for path in markdown_files() if (entry := build_log_entry(path))]
    entries.sort(key=lambda item: (item["date"], item["updatedAt"]), reverse=True)
    ai_index_summary = build_ai_index_summary(entries)
    auto_divine_races = build_auto_divine_races(entries)
    auto_win5_candidates = build_auto_win5_candidates(entries)
    risky_favorite_ranking = build_risky_favorite_ranking(entries)
    longshot_ranking = build_longshot_ranking(entries)
    win5_learning_database = build_win5_learning_database()
    win5_pattern_analysis = build_win5_pattern_analysis(win5_learning_database)
    racecourse_learning_database = build_racecourse_learning_database(entries)
    racecourse_pattern_analysis = build_racecourse_pattern_analysis(racecourse_learning_database, win5_pattern_analysis)

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
        "predictionEngine": build_prediction_engine(),
        "autoPrediction": build_auto_prediction(entries),
        "win5Dashboard": build_win5_dashboard(entries),
        "win5LearningDatabase": win5_learning_database,
        "win5PatternAnalysis": win5_pattern_analysis,
        "racecourseLearningDatabase": racecourse_learning_database,
        "racecoursePatternAnalysis": racecourse_pattern_analysis,
    }


def write_dashboard_data(output_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    payload = generate_dashboard_data()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"WRITE: {output_path.relative_to(PROJECT_ROOT)}")
    return payload


if __name__ == "__main__":
    write_dashboard_data()
