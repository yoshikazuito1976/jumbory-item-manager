from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, get_db, Base
from app.models import Item as ItemModel
from app.schemas import Item, ItemCreate, ItemUpdate

app = FastAPI()

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベーステーブルを作成
Base.metadata.create_all(bind=engine)


@app.on_event("startup")
def startup_event():
    """アプリ起動時に初期データを投入"""
    db = next(get_db())
    
    # 既にデータがある場合はスキップ
    if db.query(ItemModel).count() > 0:
        return
    
    # サンプルデータを3件追加
    sample_items = [
        ItemModel(
            name="テント（6人用）",
            category="テント",
            status="保管中",
            location="倉庫A-1",
            note="2024年購入、状態良好"
        ),
        ItemModel(
            name="寝袋（冬季用）",
            category="寝具",
            status="貸出中",
            location="倉庫A-2",
            note="田中さんに貸出中（返却予定: 2026/2/20）"
        ),
        ItemModel(
            name="ガスコンロ（2口）",
            category="調理器具",
            status="要メンテ",
            location="倉庫B-3",
            note="着火が不安定、点検必要"
        ),
    ]
    
    db.add_all(sample_items)
    db.commit()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Hello Jumbory API"}


@app.get("/api/items", response_model=List[Item])
def get_items(db: Session = Depends(get_db)):
    """備品一覧を取得"""
    items = db.query(ItemModel).all()
    return items


@app.get("/api/items/{item_id}", response_model=Item)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """備品の詳細を取得"""
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.post("/api/items", response_model=Item, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """新しい備品を登録"""
    db_item = ItemModel(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.put("/api/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    """備品を更新"""
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # 更新されたフィールドのみを適用
    for key, value in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    return db_item


@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """備品を削除"""
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return None

