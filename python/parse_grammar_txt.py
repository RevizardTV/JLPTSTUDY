#!/usr/bin/env python3
"""
parse_grammar_txt.py — Parses structured text files into app-compatible MultiSet JSON.
"""

import json
import re
import sys

def parse_txt_to_json(txt_path: str, output_json_path: str):
    try:
        with open(txt_path, "r", encoding="utf-8") as f:
            content = f.read()
    except FileNotFoundError:
        print(f"ERROR: File not found: {txt_path}", file=sys.stderr)
        sys.exit(1)

    raw_blocks = re.split(r'\n\s*---\s*\n', content)
    all_sets = []

    for block_idx, block in enumerate(raw_blocks):
        if not block.strip():
            continue

        lines = block.splitlines()
        
        set_id = f"set-multiset-vol{block_idx+1}-n5"
        title = f"Grammar & Kanji Set {block_idx+1}"
        category = "grammar"
        pack_title = "Master Batch Pack"
        tags = ["n5", "grammar"]
        context_passages = []
        context_english = []
        questions = []
        vocab = []
        answer_key_map = {}

        current_q = None
        mode = "META"

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            # Section Switcher: Answer Key
            if re.match(r'^Answer\s*Key[:\s]*', stripped, re.IGNORECASE):
                if current_q:
                    questions.append(current_q)
                    current_q = None
                mode = "ANSWERS"
                ans_text = re.sub(r'^Answer\s*Key[:\s]*', '', stripped, flags=re.IGNORECASE).strip()
                if ans_text:
                    for q_n, a_val in re.findall(r'(\d+)[\.\:]\s*([1-4])', ans_text):
                        answer_key_map[int(q_n)] = int(a_val) - 1
                continue

            # Section Switcher: Vocab Block
            if re.match(r'^(Vocab(abulary)?|New\s*Words)[:\s]*', stripped, re.IGNORECASE):
                if current_q:
                    questions.append(current_q)
                    current_q = None
                mode = "VOCAB"
                continue

            if mode == "META":
                if stripped.lower().startswith("setid:"):
                    set_id = stripped.split(":", 1)[1].strip()
                elif stripped.lower().startswith("title:"):
                    title = stripped.split(":", 1)[1].strip()
                elif stripped.lower().startswith("category:"):
                    category = stripped.split(":", 1)[1].strip()
                elif stripped.lower().startswith("packtitle:"):
                    pack_title = stripped.split(":", 1)[1].strip()
                elif stripped.lower().startswith("tags:"):
                    tags = [t.strip() for t in stripped.split(":", 1)[1].split(",")]
                elif stripped.lower().startswith("contextpassages:"):
                    passages = stripped.split(":", 1)[1].split("|")
                    context_passages = [p.strip() for p in passages]
                elif stripped.lower().startswith("contextenglish:"):
                    english = stripped.split(":", 1)[1].split("|")
                    context_english = [e.strip() for e in english]
                elif re.match(r'^\d+\.\s+', stripped):
                    mode = "QUESTIONS"

            if mode == "ANSWERS":
                for q_n, a_val in re.findall(r'(\d+)[\.\:]\s*([1-4])', stripped):
                    answer_key_map[int(q_n)] = int(a_val) - 1
                continue

            if mode == "VOCAB":
                vocab_match = re.match(r'^([^\s（\(]+)\s*[（\(]([^）\)]+)[）\)]\s*(?:\[([^\]]+)\])?\s*[-–—:]\s*(.+?)(?:\s*\(([^)]+)\))?$', stripped)
                if vocab_match:
                    w, k, r, m, tags_str = vocab_match.groups()
                    v_tags = [t.strip() for t in tags_str.split(",")] if tags_str else ["n5"]
                    vocab.append({
                        "word": w.strip(),
                        "kana": k.strip(),
                        "romaji": r.strip() if r else "",
                        "meaning": m.strip(),
                        "vocabTags": v_tags
                    })
                continue

            if mode == "META" or mode == "QUESTIONS":
                # FIX: Questions MUST use a period (e.g. "1. ") to distinguish from options ("1) ")
                q_match = re.match(r'^(\d+)\.\s+(.*)$', stripped)
                if q_match:
                    if current_q:
                        questions.append(current_q)
                    mode = "QUESTIONS"
                    current_q = {
                        "qNum": int(q_match.group(1)),
                        "prompt": q_match.group(2).strip(),
                        "contextIdx": 0,
                        "options": [],
                        "answer": 0
                    }
                    continue

                # FIX: Options MUST use a closing parenthesis (e.g. "1) ")
                opt_match = re.match(r'^([1-4①②③④])\)\s*(.*)$', stripped)
                if current_q is not None and opt_match:
                    opt_content = opt_match.group(2).strip()
                    text, kana, english = opt_content, opt_content, "definition needed"
                    if " - " in opt_content:
                        parts = opt_content.split(" - ", 1)
                        text = parts[0].strip()
                        kana = text
                        english = parts[1].strip()
                    current_q["options"].append({
                        "text": text,
                        "kana": kana,
                        "english": english
                    })
                    continue

                # Supplemental attributes inside question block
                if current_q is not None:
                    if stripped.lower().startswith("kanji:"):
                        current_q["kanji"] = stripped.split(":", 1)[1].strip()
                    elif stripped.lower().startswith("reading:"):
                        current_q["reading"] = stripped.split(":", 1)[1].strip()
                    elif stripped.lower().startswith("contextidx:"):
                        try:
                            current_q["contextIdx"] = int(stripped.split(":", 1)[1].strip())
                        except ValueError:
                            pass

        if current_q:
            questions.append(current_q)

        # Apply mapped answer keys (0-indexed)
        for q in questions:
            qn = q.get("qNum")
            if qn in answer_key_map:
                q["answer"] = answer_key_map[qn]

        if not context_passages:
            context_passages = ["Sample reading passage."]

        set_obj = {
            "id": set_id,
            "title": title,
            "category": category,
            "packTitle": pack_title,
            "tags": tags,
            "contextPassages": context_passages,
            "questions": questions
        }
        if context_english:
            set_obj["contextEnglish"] = context_english
        if vocab:
            set_obj["vocab"] = vocab

        all_sets.append(set_obj)

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(all_sets, f, ensure_ascii=False, indent=2)

    print(f"Successfully compiled {len(all_sets)} set(s) into {output_json_path}")

if __name__ == "__main__":
    txt_file = sys.argv[1] if len(sys.argv) > 1 else "Exercises Grammar.txt"
    out_file = sys.argv[2] if len(sys.argv) > 2 else "source.json"
    parse_txt_to_json(txt_file, out_file)