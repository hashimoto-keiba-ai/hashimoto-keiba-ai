from __future__ import annotations

import re
import shutil
from datetime import datetime
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = PROJECT_ROOT / "input"

COURSE_NAMES = [
    "札幌競馬場",
    "函館競馬場",
    "福島競馬場",
    "新潟競馬場",
    "東京競馬場",
    "中山競馬場",
    "中京競馬場",
    "京都競馬場",
    "阪神競馬場",
    "小倉競馬場",
]

DOC_TYPE_DIRS = {
    "事前予想": "事前予想",
    "結果検証": "結果検証",
    "OSアップデート": "OSアップデート",
    "総括": "保存ログ",
    "保存ログ": "保存ログ",
    "WIN5": "",
}

SORT_RULES = [
    ("中山", "中山競馬場"),
    ("東京", "東京競馬場"),
    ("京都", "京都競馬場"),
    ("阪神", "阪神競馬場"),
    ("中京", "中京競馬場"),
    ("新潟", "新潟競馬場"),
    ("福島", "福島競馬場"),
    ("小倉", "小倉競馬場"),
    ("札幌", "札幌競馬場"),
    ("函館", "函館競馬場"),
    ("WIN5", "WIN5"),
    ("WIN５", "WIN５"),
    ("万馬券", "万馬券DB"),
    ("結果検証", "結果検証"),
    ("AI研究", "AI研究所"),
    ("設計図", "AI研究所"),
]


def read_markdown(path: Path) -> str:
    for encoding in ("utf-8-sig", "utf-8", "cp932"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")


def normalize_course_name(value: str) -> str | None:
    cleaned = value.strip()
    for course_name in COURSE_NAMES:
        short_name = course_name.replace("競馬場", "")
        if cleaned in (course_name, short_name) or short_name in cleaned:
            return course_name
    return None


def normalize_doc_type(value: str) -> str | None:
    cleaned = value.strip()
    if "WIN5" in cleaned or "WIN５" in cleaned:
        return "WIN5"
    if "OS" in cleaned and "アップデート" in cleaned:
        return "OSアップデート"
    if "結果" in cleaned and "検証" in cleaned:
        return "結果検証"
    if "事前" in cleaned and "予想" in cleaned:
        return "事前予想"
    if "総括" in cleaned or "保存ログ" in cleaned or "月次" in cleaned:
        return "総括"
    return None


def parse_metadata(content: str) -> dict[str, str]:
    metadata: dict[str, str] = {}
    lines = content.splitlines()
    if not lines or lines[0].strip() != "---":
        return metadata

    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip('"').strip("'")

    return metadata


def detect_course(content: str, file_name: str) -> str | None:
    metadata = parse_metadata(content)
    for key in ("競馬場", "course", "Course"):
        if key in metadata:
            course_name = normalize_course_name(metadata[key])
            if course_name:
                return course_name

    haystack = f"{file_name}\n{content}"
    for course_name in COURSE_NAMES:
        short_name = course_name.replace("競馬場", "")
        if course_name in haystack or short_name in haystack:
            return course_name

    return None


def detect_doc_type(content: str, file_name: str) -> str | None:
    metadata = parse_metadata(content)
    for key in ("種別", "type", "Type"):
        if key in metadata:
            doc_type = normalize_doc_type(metadata[key])
            if doc_type:
                return doc_type

    haystack = f"{file_name}\n{content}"
    for candidate in ("WIN5", "WIN５", "OSアップデート", "結果検証", "事前予想", "保存ログ", "総括", "月次総括"):
        doc_type = normalize_doc_type(candidate)
        if candidate in haystack and doc_type:
            return doc_type

    return None


def detect_year(content: str, file_name: str) -> str:
    metadata = parse_metadata(content)
    for key in ("年", "year", "Year"):
        value = metadata.get(key, "")
        if re.fullmatch(r"\d{4}", value):
            return value

    date_value = metadata.get("日付") or metadata.get("date") or metadata.get("Date") or ""
    date_match = re.search(r"(20\d{2})", date_value)
    if date_match:
        return date_match.group(1)

    file_match = re.search(r"(20\d{2})(?:\d{2})?(?:\d{2})?", file_name)
    if file_match:
        return file_match.group(1)

    return str(datetime.now().year)


def build_destination(course: str, year: str, doc_type: str) -> Path:
    if doc_type == "WIN5":
        return PROJECT_ROOT / "WIN5"
    return PROJECT_ROOT / course / year / DOC_TYPE_DIRS[doc_type]


def find_legacy_destination(content: str, file_name: str) -> Path | None:
    haystack = f"{file_name}\n{content}"
    for keyword, folder_name in SORT_RULES:
        if keyword in haystack:
            return PROJECT_ROOT / folder_name
    return None


def find_destination(content: str, file_name: str) -> Path | None:
    course = detect_course(content, file_name)
    doc_type = detect_doc_type(content, file_name)

    if course and doc_type:
        year = detect_year(content, file_name)
        return build_destination(course, year, doc_type)

    if doc_type == "WIN5":
        return PROJECT_ROOT / "WIN5"

    return find_legacy_destination(content, file_name)


def unique_destination_path(destination_dir: Path, file_name: str) -> Path:
    destination_path = destination_dir / file_name
    if not destination_path.exists():
        return destination_path

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stem = destination_path.stem
    suffix = destination_path.suffix
    candidate = destination_dir / f"{stem}_{timestamp}{suffix}"

    counter = 2
    while candidate.exists():
        candidate = destination_dir / f"{stem}_{timestamp}_{counter}{suffix}"
        counter += 1

    return candidate


def sort_markdown_files() -> int:
    INPUT_DIR.mkdir(exist_ok=True)

    moved_count = 0
    for source_path in sorted(INPUT_DIR.glob("*.md")):
        content = read_markdown(source_path)
        destination_dir = find_destination(content, source_path.name)

        if destination_dir is None:
            print(f"SKIP: {source_path.name} -> course/type keyword not found")
            continue

        destination_dir.mkdir(parents=True, exist_ok=True)
        destination_path = unique_destination_path(destination_dir, source_path.name)
        shutil.move(str(source_path), str(destination_path))
        moved_count += 1
        print(f"MOVE: {source_path.name} -> {destination_path.relative_to(PROJECT_ROOT)}")

    print(f"DONE: moved {moved_count} file(s)")
    return moved_count


if __name__ == "__main__":
    sort_markdown_files()
