// batchUpload.test.ts
import { describe, it, expect } from "bun:test";

describe("Batch Upload JSON Parser Test", () => {
  it("should successfully parse valid JSON question set arrays", () => {
    const validJsonString = `[
      {
        "id": "ex-test-1",
        "title": "EX-TEST",
        "category": "kanji",
        "contextPassages": ["きょうはてんきがいいです。"],
        "questions": [
          {
            "qNum": 1,
            "prompt": "天気",
            "contextIdx": 0,
            "options": [
              { "text": "てんき", "kana": "てんき", "english": "weather" },
              { "text": "げんき", "kana": "げんき", "english": "healthy" }
            ],
            "answer": 0,
            "kanji": "天気",
            "reading": "てんき"
          }
        ]
      }
    ]`;

    const parsed = JSON.parse(validJsonString);
    const newSets = Array.isArray(parsed) ? parsed : [parsed];

    expect(newSets.length).toBe(1);
    expect(newSets[0].id).toBe("ex-test-1");
    expect(newSets[0].questions[0].prompt).toBe("天気");
  });

  it("should throw a SyntaxError when invalid JSON (like single quotes) is parsed", () => {
    // Invalid JSON using single quotes instead of double quotes
    const invalidJsonString = `[{'id': 'ex-bad'}]`;

    expect(() => {
      JSON.parse(invalidJsonString);
    }).toThrow(SyntaxError);
  });
});