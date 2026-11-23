#!/usr/bin/env python3
"""Generate assets/fonts/fonts.json from TTF/OTF files in the same folder."""
from pathlib import Path
import json
import re

FONT_DIR = Path(__file__).resolve().parents[1] / "assets" / "fonts"
SUPPORTED = {".ttf", ".otf"}

def display_name(path: Path) -> str:
    try:
        from fontTools.ttLib import TTFont
        font = TTFont(str(path), lazy=True)
        names = font["name"].names
        for name_id in (16, 1):
            for record in names:
                if record.nameID == name_id:
                    value = record.toUnicode().strip()
                    if value:
                        font.close()
                        return value
        font.close()
    except Exception:
        pass
    name = path.stem.replace("_", " ").replace("-", " ").strip()
    return re.sub(r"\s+", " ", name) or path.name

fonts = []
for path in sorted(FONT_DIR.iterdir(), key=lambda p: p.name.lower()):
    if path.is_file() and path.suffix.lower() in SUPPORTED:
        fonts.append({
            "name": display_name(path),
            "file": "./assets/fonts/" + path.name,
            "default": path.name.lower() == "font.ttf"
        })

if not fonts:
    raise SystemExit("Tidak ada file .ttf atau .otf di assets/fonts/")

if not any(item["default"] for item in fonts):
    fonts[0]["default"] = True

target = FONT_DIR / "fonts.json"
target.write_text(json.dumps({"fonts": fonts}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Daftar font diperbarui: {len(fonts)} font -> {target}")
