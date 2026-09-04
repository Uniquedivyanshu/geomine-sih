from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import pypdf
import io

app = FastAPI(title="GeoMine AI Backend")

# CORS setup for Vercel Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "GeoMine AI Backend Operational"}

@app.post("/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...), api_key: str = Form(None)):
    try:
        # 1. Read PDF File Content
        pdf_bytes = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() or ""

        if not extracted_text.strip():
            return {"error": "PDF से टेक्स्ट नहीं पढ़ा जा सका। कृपया टेक्स्ट वाली (Searchable) PDF अपलोड करें।"}

        # 2. Gemini AI Processing Logic
        if api_key and api_key.strip():
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = (
                "You are an expert geological and mining engineer. Analyze the following text extracted from a document. "
                "If it is a mining report, summarize key geological strata, mineral reserves, and safety hazards. "
                "If it is not a mining report, summarize its core topic accurately and specify that it is a non-mining document.\n\n"
                f"Document Text:\n{extracted_text[:4000]}"
            )
            response = model.generate_content(prompt)
            summary = response.text
        else:
            # Fallback text summary if API key is not provided
            summary = (
                f"📄 **Document Analyzed:** {file.filename}\n"
                f"📏 **Text Extracted:** {len(extracted_text)} characters read.\n\n"
                "**Summary Preview:**\n" + extracted_text[:500] + "...\n\n"
                "⚠️ *Note: Enter a valid Gemini API Key on the dashboard to get real-time AI Generative insights.*"
            )

        return {
            "filename": file.filename,
            "summary": summary
        }

    except Exception as e:
        return {"error": str(e)}