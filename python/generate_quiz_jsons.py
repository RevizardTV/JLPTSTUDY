import csv
import json
from collections import defaultdict

def parse_csv_to_sets(csv_filepath):
    sets_dict = defaultdict(lambda: {
        "id": "",
        "title": "",
        "category": "",
        "packTitle": "",
        "tags": [],
        "contextPassages": [],
        "questions": [],
        "vocab_map": {}  # Used to deduplicate vocab items per set
    })

    with open(csv_filepath, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            set_id = row['set_id'].strip()
            current_set = sets_dict[set_id]
            
            # 1. Populate Set Metadata
            if not current_set["id"]:
                current_set["id"] = set_id
                current_set["title"] = row['set_title'].strip()
                current_set["category"] = row['category'].strip()
                current_set["packTitle"] = row['pack_title'].strip()
                current_set["tags"] = [t.strip() for t in row['tags'].split(';') if t.strip()]
                current_set["contextPassages"] = [p.strip() for p in row['context_passages'].split('|') if p.strip()]

            # 2. Build Question Object
            question = {
                "qNum": int(row['q_num']),
                "prompt": row['prompt'].strip(),
                "contextIdx": int(row['context_idx']),
                "options": [
                    {"text": row['opt1_text'].strip(), "kana": row['opt1_kana'].strip(), "english": row['opt1_english'].strip()},
                    {"text": row['opt2_text'].strip(), "kana": row['opt2_kana'].strip(), "english": row['opt2_english'].strip()},
                    {"text": row['opt3_text'].strip(), "kana": row['opt3_kana'].strip(), "english": row['opt3_english'].strip()},
                    {"text": row['opt4_text'].strip(), "kana": row['opt4_kana'].strip(), "english": row['opt4_english'].strip()},
                ],
                "answer": int(row['answer']),
                "kanji": row['q_kanji'].strip() if row['q_kanji'].strip() else None,
                "reading": row['q_reading'].strip() if row['q_reading'].strip() else None
            }
            current_set["questions"].append(question)

            # 3. Build Vocab Item Object (if provided)
            vocab_word = row.get('vocab_word', '').strip()
            if vocab_word and vocab_word not in current_set["vocab_map"]:
                current_set["vocab_map"][vocab_word] = {
                    "word": vocab_word,
                    "kana": row.get('vocab_kana', '').strip(),
                    "romaji": row.get('vocab_romaji', '').strip(),
                    "meaning": row.get('vocab_meaning', '').strip(),
                    "vocabTags": [vt.strip() for vt in row.get('vocab_tags', '').split(';') if vt.strip()]
                }

    # Final conversion into clean list structure matching Svelte QuestionSet type
    formatted_multiset = []
    for s_id, s_data in sets_dict.items():
        formatted_multiset.append({
            "id": s_data["id"],
            "title": s_data["title"],
            "category": s_data["category"],
            "packTitle": s_data["packTitle"],
            "tags": s_data["tags"],
            "contextPassages": s_data["contextPassages"],
            "questions": s_data["questions"],
            "vocab": list(s_data["vocab_map"].values())
        })

    return formatted_multiset

def main():
    csv_file = "quiz_data.csv"
    
    print(f"Reading {csv_file}...")
    question_sets = parse_csv_to_sets(csv_file)

    # 1. Output Multi-Set JSON (Array of all question sets)
    multiset_output = "MultiSetJson_example.json"
    with open(multiset_output, "w", encoding="utf-8") as f:
        json.dump(question_sets, f, ensure_ascii=False, indent=2)
    print(f"✅ Generated Multi-Set JSON: {multiset_output} ({len(question_sets)} sets)")

    # 2. Output Batch JSON (Single set wrapping, using the first set as example)
    if question_sets:
        batch_output = "MultipleQuestionsBatchJson_example.json"
        with open(batch_output, "w", encoding="utf-8") as f:
            json.dump([question_sets[0]], f, ensure_ascii=False, indent=2)
        print(f"✅ Generated Single Batch JSON: {batch_output} (1 set with {len(question_sets[0]['questions'])} questions)")

if __name__ == "__main__":
    main()