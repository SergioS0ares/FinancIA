from fastapi import APIRouter, File, UploadFile

from ...models.extract import ExtractResponse
from ...services.gemini_service import analyze_statement


router = APIRouter()


@router.post("/extract", response_model=ExtractResponse)
async def extract_from_image(file: UploadFile = File(...)):
    content = await file.read()
    result = await analyze_statement(content)
    return ExtractResponse(result=result)

