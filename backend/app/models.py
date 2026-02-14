from sqlalchemy import Column, Integer, String
from app.database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 保管中/貸出中/要メンテ
    location = Column(String, nullable=False)
    note = Column(String, nullable=True)
