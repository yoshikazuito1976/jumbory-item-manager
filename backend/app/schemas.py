from pydantic import BaseModel
from typing import Optional


class ItemBase(BaseModel):
    name: str
    category: str
    status: str
    location: str
    note: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    note: Optional[str] = None


class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True
