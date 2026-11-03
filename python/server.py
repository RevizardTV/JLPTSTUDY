from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel
import shutil
import os

app = FastAPI()

print("Initializing Whisper model...")
# 'medium' model accurately renders Japanese Kanji and Kana compounds
model = WhisperModel("medium", device="cpu", compute_type="int8")
print("Whisper model ready!")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        segments, info = model.transcribe(temp_file, language="ja", beam_size=5)
        text = "".join([segment.text for segment in segments])
        return {"text": text, "language": info.language}
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)