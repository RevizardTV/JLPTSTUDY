#!/usr/bin/env python3
"""
compile_dsl.py — expand a compact .dsl file into source.json, then optionally
build the final app JSON by delegating to build_sets.py.

Usage:
  python compile_dsl.py source.dsl                    # -> source.json
  python compile_dsl.py source.dsl --build            # -> source.json + JTEST4U_PACK1_GRAMMAR.json
  python compile_dsl.py source.dsl --build --per-set  # -> source.json + out/*.json
"""
import json
import re
import sys
import subprocess
import argparse
from typing import Any, NoReturn

def die(msg: str) -> NoReturn:
    print(f"DSL ERROR: {msg}", file=sys.stderr)
    sys.exit(1)

OPT_RE = re.compile(r"^(?P<text>[^\[]+?)(?:\[(?:(?P<kana>[^=\]]+)=)?(?P<english>[^\]]*)\])?$")

def parse_option(raw: str, lineno: int) -> dict[str, str]:
    raw = raw.strip()
    m = OPT_RE.match(raw)
    if not m:
        die(f"line {lineno}: bad option syntax: {raw!r}")
    text = m.group("text").strip()
    kana = (m.group("kana") or text).strip()
    english = (m.group("english") or "").strip()
    if not text:
        die(f"line {lineno}: empty option text")
    if not english:
        die(f"line {lineno}: option {text!r} missing [english] annotation")
    return {"text": text, "kana": kana, "english": english}

def split_pipe(line: str, lineno: int, expected: int) -> list[str]:
    parts = [p.strip() for p in line.split("|")]
    if len(parts) != expected:
        die(f"line {lineno}: expected {expected} pipe-separated fields, got {len(parts)}: {line!r}")
    return parts

def compile_dsl(path: str, no_shuffle: bool) -> dict[str, Any]:
    with open(path, encoding="utf-8-sig") as f:
        lines = f.readlines()

    pack_title: str | None = None
    sets: list[dict[str, Any]] = []

    # Per-current-set state — explicitly typed.
    cur: dict[str, Any] | None = None
    cur_ctx: list[str] = []
    cur_ctx_en: list[str] = []
    use_english_ctx: bool | None = None
    qcounter = 0

    for i, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n")
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        if line.startswith("@pack "):
            if cur is not None:
                die(f"line {i}: @pack must appear before any @set")
            pack_title = line[len("@pack "):].strip()
            if not pack_title:
                die(f"line {i}: @pack needs a title")
            continue

        if line.startswith("@set "):
            body = line[len("@set "):]
            parts = split_pipe(body, i, 4)
            set_id, title, category, tags_csv = parts
            if not set_id or not title or not category:
                die(f"line {i}: @set needs id | title | category | tags")
            tags: list[str] = [t.strip() for t in tags_csv.split(",") if t.strip()]
            cur = {
                "id": set_id,
                "title": title,
                "category": category,
                "tags": tags,
                "contextPassages": [],
                "contextEnglish": [],
                "questions": [],
                "vocab": [],
            }
            sets.append(cur)
            # Bind list aliases AFTER cur is built so they reference the same objects.
            cur_ctx = cur["contextPassages"]      # type: ignore[assignment]
            cur_ctx_en = cur["contextEnglish"]    # type: ignore[assignment]
            use_english_ctx = None
            qcounter = 0
            continue

        if line.startswith("@ctx "):
            if cur is None:
                die(f"line {i}: @ctx before any @set")
            body = line[len("@ctx "):]
            parts = [p.strip() for p in body.split("|")]
            if len(parts) not in (1, 2):
                die(f"line {i}: @ctx must be 'japanese' or 'japanese | english'")
            ja = parts[0]
            en = parts[1] if len(parts) == 2 else None
            if not ja:
                die(f"line {i}: @ctx japanese text empty")
            if en is not None and not en:
                die(f"line {i}: @ctx english text empty (omit the pipe to omit English)")
            has_en = en is not None
            if use_english_ctx is None:
                use_english_ctx = has_en
            elif use_english_ctx != has_en:
                die(f"line {i}: inconsistent @ctx English presence — all @ctx in a set must either include or omit English")
            cur_ctx.append(ja)
            if has_en:
                assert en is not None
                cur_ctx_en.append(en)
            continue

        if line.startswith("q "):
            if cur is None:
                die(f"line {i}: q line before any @set")
            body = line[len("q "):]
            # optional forced answer index: q!3 ...
            forced: int | None = None
            fm = re.match(r"^!(\d)\s+(.*)$", body)
            if fm:
                forced = int(fm.group(1))
                if forced not in (0, 1, 2, 3):
                    die(f"line {i}: forced answer index must be 0..3")
                body = fm.group(2)
            parts = split_pipe(body, i, 6)
            prompt, correct_raw, d1, d2, d3, ctx_raw = parts
            if not prompt:
                die(f"line {i}: empty prompt")
            try:
                ctx_idx = int(ctx_raw)
            except ValueError:
                die(f"line {i}: contextIdx must be integer, got {ctx_raw!r}")
            if not cur_ctx:
                die(f"line {i}: q line but set has no @ctx yet")
            if ctx_idx < 0 or ctx_idx >= len(cur_ctx):
                die(f"line {i}: contextIdx {ctx_idx} out of range 0..{len(cur_ctx)-1}")

            options_in_order: list[dict[str, str]] = [
                parse_option(correct_raw, i),
                parse_option(d1, i),
                parse_option(d2, i),
                parse_option(d3, i),
            ]
            # rotate answer position deterministically unless forced/disabled
            if forced is not None:
                ans = forced
            elif no_shuffle:
                ans = 0
            else:
                ans = qcounter % 4
            # rotate: put correct at `ans`, shift others around preserving order
            correct = options_in_order[0]
            others = options_in_order[1:]
            options: list[dict[str, str] | None] = [None, None, None, None]
            options[ans] = correct
            j = 0
            for k in range(4):
                if options[k] is None:
                    options[k] = others[j]
                    j += 1
            final_options: list[dict[str, str]] = [o for o in options if o is not None]
            if len(final_options) != 4:
                die(f"line {i}: internal error building options")

            qcounter += 1
            cur["questions"].append({           # type: ignore[index]
                "qNum": qcounter,
                "prompt": prompt,
                "contextIdx": ctx_idx,
                "options": final_options,
                "answer": ans,
            })
            continue

        if line.startswith("v "):
            if cur is None:
                die(f"line {i}: v line before any @set")
            body = line[len("v "):]
            parts = split_pipe(body, i, 5)
            word, kana, romaji, meaning, tags_csv = parts
            if not word or not meaning:
                die(f"line {i}: vocab needs at least word and meaning")
            tags: list[str] = [t.strip() for t in tags_csv.split(",") if t.strip()]
            entry: dict[str, Any] = {"word": word, "meaning": meaning}
            if kana:
                entry["kana"] = kana
            if romaji:
                entry["romaji"] = romaji
            if tags:
                entry["vocabTags"] = tags
            cur["vocab"].append(entry)          # type: ignore[index]
            continue

        die(f"line {i}: unrecognized directive: {line!r}")

    if not sets:
        die("no @set found")

    for s in sets:
        if use_english_ctx is False:
            s.pop("contextEnglish", None)
        if not s["vocab"]:
            s.pop("vocab", None)

    out: dict[str, Any] = {"sets": sets}
    if pack_title:
        out["packTitle"] = pack_title
    return out

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("dsl")
    ap.add_argument("--out", default="source.json")
    ap.add_argument("--no-shuffle", action="store_true",
                    help="always put correct answer at option 0")
    ap.add_argument("--build", action="store_true",
                    help="after writing source.json, run build_sets.py on it")
    ap.add_argument("--per-set", action="store_true",
                    help="pass through to build_sets.py")
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()

    data = compile_dsl(args.dsl, args.no_shuffle)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"wrote {args.out} ({len(data['sets'])} set(s), "
          f"{sum(len(s['questions']) for s in data['sets'])} question(s))")

    if args.build or args.validate_only:
        cmd = [sys.executable, "build_sets.py", args.out]
        if args.validate_only:
            cmd.append("--validate-only")
        if args.per_set:
            cmd.append("--per-set")
        sys.exit(subprocess.call(cmd))

if __name__ == "__main__":
    main()