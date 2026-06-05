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
    match = re.search(r"-?\d+(?:\.\d+)?", value)
    return float(match.group(0)) if match else None


def build_log_entry(path: Path) -> dict[str, Any] | None:
    content = read_markdown(path)
    metadata = parse_metadata(content)
    course = detect_course(content, path.name)
    doc_type = detect_doc_type(content, path.name)

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
        "category": DOC_TYPE_DIRS[doc_type],
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
    for course_name in COURSE_NAMES:
        course_dir = PROJECT_ROOT / course_name
        if not course_dir.exists():
            continue
        files.extend(path for path in course_dir.rglob("*.md") if path.is_file())
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


def generate_dashboard_data() -> dict[str, Any]:
    entries = [entry for path in markdown_files() if (entry := build_log_entry(path))]
    entries.sort(key=lambda item: (item["date"], item["updatedAt"]), reverse=True)

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
        "courseMemos": build_course_memos(entries),
    }


def write_dashboard_data(output_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    payload = generate_dashboard_data()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"WRITE: {output_path.relative_to(PROJECT_ROOT)}")
    return payload


if __name__ == "__main__":
    write_dashboard_data()
