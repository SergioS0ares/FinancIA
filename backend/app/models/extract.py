from pydantic import BaseModel


class ExtractRequest(BaseModel):
    description: str | None = None


class ExtractResponse(BaseModel):
    result: dict

