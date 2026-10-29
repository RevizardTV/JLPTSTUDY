#!/usr/bin/env python3
"""
parse_grammar_txt.py — parse 'Exercises Grammar.txt' into source.json.

Handles:
  * EX-N headers, sequential flattening (crosses exercise boundaries freely)
  * Question prompts with ______ blanks, wrapped across lines
  * 4-option blocks (with continuation lines)
  * Answer Key:  "Question N: M (...)"  (1-indexed -> 0-indexed)
  * New words:   "Word (romaji): english"
  * EX-11+ paragraph format: "「1」から「5」に..." with sub-questions 6-10

Output:
  source.json  -- compact schema that build_sets.py expands
  questions_with_options.txt  -- audit report: every prompt + its 4 options,
                                 so you can fill in kana/english if needed

Usage:
  python parse_grammar_txt.py "Exercises Grammar.txt" --out source.json
  python parse_grammar_txt.py "Exercises Grammar.txt" --per-set-chunk 50
"""
import re
import sys
import json
import argparse
from pathlib import Path

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
FULLWIDTH_SPACE = "\u3000"

def norm(s: str) -> str:
    """Normalize weird whitespace but keep Japanese text intact."""
    s = s.replace(FULLWIDTH_SPACE, " ")
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    return s

def is_blank_line(s: str) -> bool:
    return not s.strip()

def die(msg: str) -> "None":
    print(f"PARSE ERROR: {msg}", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Split into exercise blocks
# ---------------------------------------------------------------------------
def split_exercises(text: str) -> list[tuple[int, str]]:
    """
    Returns [(ex_num, body), ...] where body is everything between this
    'EX-N' header and the next one. The 'Answer Key:' and 'New words:'
    sections stay inside body.
    """
    pattern = re.compile(r'^EX-(\d+)\s*$', re.MULTILINE)
    matches = list(pattern.finditer(text))
    if not matches:
        die("no EX-N headers found")
    out = []
    for i, m in enumerate(matches):
        ex_num = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        out.append((ex_num, text[start:end]))
    return out

# ---------------------------------------------------------------------------
# Split each block into Question / Answer Key / New words sections
# ---------------------------------------------------------------------------
def split_sections(body: str) -> tuple[str, str, str]:
    # Answer Key: can appear once
    m = re.search(r'^Answer Key:\s*$', body, re.MULTILINE)
    if not m:
        return body, "", ""
    q_part = body[:m.start()]
    rest = body[m.end():]

    m2 = re.search(r'^New words:\s*$', rest, re.MULTILINE)
    if not m2:
        return q_part, rest, ""
    ak_part = rest[:m2.start()]
    nw_part = rest[m2.end():]
    return q_part, ak_part, nw_part

# ---------------------------------------------------------------------------
# Parse questions from the Question section
# ---------------------------------------------------------------------------
Q_HEADER_RE = re.compile(r'^\s*(\d+)\.\s*(.*)$')
OPTION_RE = re.compile(r'^\s*(\S.*?)\s*$')

def parse_questions(q_part: str, ex_num: int) -> list[dict]:
    """
    Parse questions. Two shapes exist in the source:

    Shape A (EX-1..EX-10, EX-12..EX-20 etc.):
        1. prompt text here
         option1
         option2
         option3
         option4

    Shape B (EX-11 has paragraphs with 「1」..「5」, then separate 6..10):
        「１」から「５」に何を入れますか。...
        <paragraph with blanks>
        6. 「１」に何を入れますか。
         option1
         ...

    We only extract numbered questions that are followed by 4 options.
    The paragraph text from Shape B is skipped here (it becomes context
    for the numbered sub-questions; we don't try to answer the 「N」 blanks).
    """
    lines = q_part.split("\n")
    questions = []
    i = 0
    n = len(lines)
    while i < n:
        m = Q_HEADER_RE.match(lines[i])
        if not m:
            i += 1
            continue
        qnum = int(m.group(1))
        prompt = m.group(2).strip()
        i += 1

        # prompt may wrap: if the next line isn't blank and isn't an option
        # (i.e. it doesn't look like a bare option), treat it as continuation.
        # Heuristic: options are short (< 40 chars) and have no sentence-ending
        # punctuation; prompts usually end with 。/？/_______ or are long.
        while i < n and not is_blank_line(lines[i]):
            nxt = lines[i].strip()
            if Q_HEADER_RE.match(lines[i]):
                break
            # If we already have prompt text ending with blank marker or
            # punctuation, and next line is short, it's an option.
            looks_like_prompt_continuation = (
                (len(nxt) > 40) or
                (prompt.endswith(("_______", "＿＿", "。", "？", "?", "、")))
                is False
            )
            if looks_like_prompt_continuation and not OPTION_RE.match(nxt):
                break
            # For most cases, the prompt is one line; don't over-eagerly append.
            break

        # Collect 4 options
        opts = []
        while i < n and len(opts) < 4:
            if is_blank_line(lines[i]):
                i += 1
                continue
            if Q_HEADER_RE.match(lines[i]):
                break
            cand = lines[i].strip()
            # Strip leading numbering or stray markers
            opts.append(cand)
            i += 1

        if len(opts) != 4:
            # Not a well-formed question; skip it (audit will flag missing).
            questions.append({
                "qNum": qnum, "prompt": prompt, "options": opts,
                "parse_warning": f"expected 4 options, got {len(opts)}"
            })
            continue

        questions.append({"qNum": qnum, "prompt": prompt, "options": opts})
    return questions

# ---------------------------------------------------------------------------
# Parse answer key
# ---------------------------------------------------------------------------
AK_RE = re.compile(r'Question\s+(\d+):\s*(\d+)')

def parse_answers(ak_part: str) -> dict[int, int]:
    """Returns {question_number: 0-indexed_answer}."""
    out: dict[int, int] = {}
    for m in AK_RE.finditer(ak_part):
        qn = int(m.group(1))
        ans1 = int(m.group(2))         # 1-indexed in source
        if not (1 <= ans1 <= 4):
            die(f"answer key for Q{qn} out of range 1..4: {ans1}")
        out[qn] = ans1 - 1
    return out

# ---------------------------------------------------------------------------
# Parse New words section
# ---------------------------------------------------------------------------
# Formats seen in the source:
#   "毎日 (mainichi): every day"
#   "毎日 (mainichi): every day, daily"          (commas ok)
#   "来る (kuru): to come, to arrive"
#   "こども (kodomo): child, children"
#   Some entries wrap; we join continuations onto the meaning.
NW_RE = re.compile(r'^\s*(?P<word>.+?)\s*\((?P<romaji>[^)]+)\)\s*:\s*(?P<meaning>.+)$')

def parse_new_words(nw_part: str) -> list[dict]:
    """
    Returns list of {'word', 'romaji', 'meaning'} preserving source order.
    Multi-line meanings (rare) are joined with a space.
    """
    entries: list[dict] = []
    pending: dict | None = None
    for raw in nw_part.split("\n"):
        line = raw.rstrip()
        if not line.strip():
            if pending:
                entries.append(pending)
                pending = None
            continue
        m = NW_RE.match(line)
        if m:
            if pending:
                entries.append(pending)
            pending = {
                "word": m.group("word").strip(),
                "romaji": m.group("romaji").strip(),
                "meaning": m.group("meaning").strip(),
            }
        else:
            # Continuation of previous meaning
            if pending is not None:
                pending["meaning"] += " " + line.strip()
            # else: stray line, ignore
    if pending:
        entries.append(pending)
    return entries

# ---------------------------------------------------------------------------
# Kana/English annotation (fallback)
# ---------------------------------------------------------------------------
# We don't have kana or english per option from the source. We produce a
# fallback: kana = option text (if pure kana), else option text; english = "".
# The audit file lists every option so you can fill in english manually (or
# rely on build_sets.py's --kana-map for distractor kanji inference).

KANA_RE = re.compile(r'^[\u3040-\u309F\u30A0-\u30FF\u30FC]+$')
KANJI_RE = re.compile(r'[\u4E00-\u9FFF]')

def annotate_option(text: str) -> dict:
    text = text.strip()
    if KANA_RE.match(text):
        kana = text
    else:
        kana = text   # no furigana info available; caller can fix
    return {"text": text, "kana": kana, "english": ""}  # english filled later

# ---------------------------------------------------------------------------
# Build one source-set from a chunk of questions
# ---------------------------------------------------------------------------
def build_set(set_id: str, title: str, questions: list[dict],
              answers: dict[int, int], ex_range: str) -> dict:
    """
    questions: list of {qNum, prompt, options[4]}, already flattened and in order.
    answers:   dict qNum -> 0-indexed answer for THIS EXERCISE.
    """
    ctx = []
    qs_out = []
    for i, q in enumerate(questions, start=1):
        prompt = q["prompt"]
        ctx.append(prompt)
        opts = [annotate_option(o) for o in q["options"]]
        # Look up answer
        if q["qNum"] not in answers:
            die(f"set {set_id}: missing answer for EX-Q{q['qNum']}")
        ans = answers[q["qNum"]]
        if not (0 <= ans <= 3):
            die(f"set {set_id}: answer {ans} out of range for EX-Q{q['qNum']}")
        qs_out.append({
            "qNum": i,
            "prompt": prompt,
            "contextIdx": i - 1,
            "options": opts,
            "answer": ans,
        })
    return {
        "id": set_id,
        "title": title,
        "category": "grammar",
        "tags": ["n5", "grammar", "sequential", "beginner"],
        "contextPassages": ctx,
        "questions": qs_out,
    }

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--out", default="source.json")
    ap.add_argument("--per-set-chunk", type=int, default=50,
                    help="questions per set (default: 50)")
    ap.add_argument("--audit-out", default="questions_with_options.txt",
                    help="audit report listing every prompt+options")
    args = ap.parse_args()

    text = norm(Path(args.source).read_text(encoding="utf-8"))
    exercises = split_exercises(text)

    # Flatten across all exercises, preserving order.
    all_questions: list[dict] = []
    all_answers: dict[int, int] = {}   # NOTE: qNum is per-exercise, so we
                                        # key by a composite below.
    # We need composite key: (ex_num, qNum).
    composite_answers: dict[tuple[int, int], int] = {}
    all_vocab: list[dict] = []
    per_ex_qcount: dict[int, int] = {}

    for ex_num, body in exercises:
        q_part, ak_part, nw_part = split_sections(body)
        qs = parse_questions(q_part, ex_num)
        answers = parse_answers(ak_part)
        vocab = parse_new_words(nw_part)

        # Sort questions by qNum
        qs.sort(key=lambda q: q["qNum"])
        for q in qs:
            key = (ex_num, q["qNum"])
            if key not in answers:
                die(f"EX-{ex_num} Q{q['qNum']}: no answer in Answer Key")
            composite_answers[key] = answers[q["qNum"]]
            q["_ex"] = ex_num
            q["_key"] = key
        per_ex_qcount[ex_num] = len(qs)
        all_questions.extend(qs)
        all_vocab.extend(vocab)

        print(f"EX-{ex_num}: {len(qs)} q, {len(answers)} answers, {len(vocab)} vocab",
              file=sys.stderr)

    if not all_questions:
        die("no questions parsed")

    # Chunk into sets of size N.
    chunk = max(1, args.per_set_chunk)
    sets = []
    for idx in range(0, len(all_questions), chunk):
        chunk_qs = all_questions[idx:idx + chunk]
        set_index = idx // chunk + 1
        set_id = f"set-grammar-seq-{set_index:02d}"
        title = f"N5 Grammar Set {set_index}: Questions {idx+1}-{idx+len(chunk_qs)}"

        # Build per-chunk answer map keyed by the question's composite key,
        # then remap to sequential qNum 1..N for the set.
        local_answers: dict[int, int] = {}
        for seq_i, q in enumerate(chunk_qs, start=1):
            local_answers[seq_i] = composite_answers[q["_key"]]

        # The build_set() helper expects questions with qNum 1..N matching
        # local_answers keys, so we rebind here.
        rebound = []
        for seq_i, q in enumerate(chunk_qs, start=1):
            rebound.append({
                "qNum": seq_i,
                "prompt": q["prompt"],
                "options": q["options"],
            })
        s = build_set(set_id, title, rebound, local_answers,
                      ex_range=f"{chunk_qs[0]['_ex']}-{chunk_qs[-1]['_ex']}")
        s["tags"] = ["n5", "grammar", "sequential", "beginner",
                     f"ex{chunk_qs[0]['_ex']}-{chunk_qs[-1]['_ex']}"]
        sets.append(s)

    # Attach all vocab to the LAST set (or distribute). Simpler: one vocab
    # pool per pack, attached to first set.
    seen_words = set()
    dedup_vocab = []
    for v in all_vocab:
        if v["word"] in seen_words:
            continue
        seen_words.add(v["word"])
        dedup_vocab.append(v)
    if dedup_vocab and sets:
        sets[0]["vocab"] = dedup_vocab

    out = {
        "packTitle": "JTEST4U_PACK1_GRAMMAR",
        "sets": sets,
    }
    Path(args.out).write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {args.out}: {len(sets)} set(s), "
          f"{sum(len(s['questions']) for s in sets)} question(s), "
          f"{len(dedup_vocab)} vocab item(s)", file=sys.stderr)

    # Audit file
    audit_lines = []
    for s in sets:
        audit_lines.append(f"=== {s['id']} — {s['title']} ===")
        for q in s["questions"]:
            audit_lines.append(f"Q{q['qNum']}. {q['prompt']}")
            for oi, o in enumerate(q["options"]):
                mark = " <-- ANSWER" if oi == q["answer"] else ""
                audit_lines.append(
                    f"   [{oi}] text={o['text']!r} kana={o['kana']!r} "
                    f"english=<FILL>{mark}")
            audit_lines.append("")
    Path(args.audit_out).write_text(
        "\n".join(audit_lines), encoding="utf-8")
    print(f"wrote {args.audit_out} (audit; fill in 'english' fields)",
          file=sys.stderr)

if __name__ == "__main__":
    main()