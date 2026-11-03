from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
import os
import shutil
import tempfile
import pykakasi
from dotenv import load_dotenv # keep standard load_dotenv
load_dotenv()

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

app = FastAPI()
kks = pykakasi.kakasi()

print("Loading Whisper model into memory...")
model_size = "base" 
model = WhisperModel(model_size, device="cpu", compute_type="int8")
print("Whisper model loaded successfully!")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    temp_file_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # 1. Transcribe normal Japanese (Kanji + Kana)
        segments_ja, info_ja = model.transcribe(temp_file_path, beam_size=5, language="ja", task="transcribe")
        kanji_text = "".join([s.text for s in segments_ja]).strip()

        # 2. Translate to English using Whisper's built-in translation task
        segments_en, _ = model.transcribe(temp_file_path, beam_size=5, language="ja", task="translate")
        english_text = "".join([s.text for s in segments_en]).strip()

        # 3. Convert Kanji/Kana text into Pure Kana (Hiragana) using pykakasi
        conversion_result = kks.convert(kanji_text)
        kana_text = "".join([item['hira'] for item in conversion_result])

        return {
            "language": info_ja.language,
            "duration": info_ja.duration,
            "kanji": kanji_text,
            "kana": kana_text,
            "english": english_text
        }

    except Exception as err:
        print(f"Transcription error: {err}")
        raise HTTPException(status_code=500, detail=str(err))
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass