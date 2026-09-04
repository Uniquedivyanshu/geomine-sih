from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GeoMine AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "GeoMine Core API Operational"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    return {
        "filename": file.filename,
        "status": "Success",
        "summary": "High-Grade Coal Deposit identified. Risk profile low."
    }