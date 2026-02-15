from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import os
import uvicorn

from app.database import engine, get_db, Base
from app.models import Item as ItemModel, Group as GroupModel, Leader as LeaderModel, Scout as ScoutModel
from app.schemas import (
    Item, ItemCreate, ItemUpdate,
    Group, GroupCreate,
    Leader, LeaderCreate, LeaderUpdate,
    Scout, ScoutCreate, ScoutUpdate
)

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
    if db.query(GroupModel).count() > 0:
        return
    
    # 団データを追加
    groups = [
        GroupModel(name="春日部第９団", description="ボーイスカウト春日部第９団"),
        GroupModel(name="春日部第７団", description="ボーイスカウト春日部第７団"),
        GroupModel(name="久喜第１団", description="ボーイスカウト久喜第１団"),
        GroupModel(name="久喜第２１団", description="ボーイスカウト久喜第２１団"),
        GroupModel(name="蓮田第１団", description="ボーイスカウト蓮田第１団"),
        GroupModel(name="蓮田第３団", description="ボーイスカウト蓮田第３団"),
        GroupModel(name="加須第１団", description="ボーイスカウト加須第１団"),
        GroupModel(name="宮代第１団", description="ボーイスカウト宮代第１団"),
        GroupModel(name="共有", description="全団共有備品"),
    ]
    db.add_all(groups)
    db.commit()
    
    # 指導者データを追加
    leaders = [
        LeaderModel(name="田中太郎", group_id=1, role="団委員長", gender="男", phone="090-1234-5678", email="tanaka@example.com"),
        LeaderModel(name="鈴木花子", group_id=1, role="副長", gender="女", phone="090-2345-6789", email="suzuki@example.com"),
        LeaderModel(name="佐藤一郎", group_id=2, role="隊長", gender="男", phone="090-3456-7890", email="sato@example.com"),
        LeaderModel(name="山田美咲", group_id=3, role="副長", gender="女", phone="090-4567-8901", email="yamada@example.com"),
    ]
    db.add_all(leaders)
    db.commit()
    
    # スカウトデータを追加
    scouts = [
        ScoutModel(name="高橋健太", name_kana="たかはしけんた", group_id=1, grade="小6", rank="1級", gender="男", patrol="イーグル班"),
        ScoutModel(name="伊藤大輔", name_kana="いとうだいすけ", group_id=1, grade="小5", rank="2級", gender="男", patrol="タイガー班"),
        ScoutModel(name="渡辺翔太", name_kana="わたなべしょうた", group_id=2, grade="中1", rank="初級", gender="男", patrol="ビーバー班"),
        ScoutModel(name="中村陽菜", name_kana="なかむらひな", group_id=2, grade="中2", rank="1級", gender="女", patrol="パンダ班"),
        ScoutModel(name="小林蓮", name_kana="こばやしれん", group_id=3, grade="中3", rank="菊", gender="男", patrol="ドラゴン班"),
    ]
    db.add_all(scouts)
    db.commit()
    
    # サンプル備品データを10件追加
    sample_items = [
        ItemModel(
            name="テント（6人用）",
            category="テント",
            status="保管中",
            location="倉庫A-1",
            owner_group_id=1,
            approved_leader_id=1,
            note="2024年購入、状態良好"
        ),
        ItemModel(
            name="寝袋（冬季用）",
            category="寝具",
            status="貸出中",
            location="倉庫A-2",
            owner_group_id=2,
            approved_leader_id=3,
            responsible_scout_id=3,
            note="田中さんに貸出中（返却予定: 2026/2/20）"
        ),
        ItemModel(
            name="ガスコンロ（2口）",
            category="調理器具",
            status="要メンテ",
            location="倉庫B-3",
            owner_group_id=3,
            approved_leader_id=4,
            note="着火が不安定、点検必要"
        ),
        ItemModel(
            name="ランタン（LED）",
            category="照明器具",
            status="保管中",
            location="倉庫C-1",
            owner_group_id=1,
            approved_leader_id=1,
            responsible_scout_id=1,
            note="予備の電池あり"
        ),
        ItemModel(
            name="クーラーボックス（50L）",
            category="食品保管",
            status="保管中",
            location="倉庫A-3",
            owner_group_id=4,
            note="保冷剤も一緒に保管"
        ),
        ItemModel(
            name="折りたたみテーブル",
            category="家具",
            status="貸出中",
            location="倉庫B-1",
            owner_group_id=2,
            approved_leader_id=3,
            responsible_scout_id=4,
            note="山田さんに貸出中（返却予定: 2026/2/25）"
        ),
        ItemModel(
            name="折りたたみチェア（10脚セット）",
            category="家具",
            status="保管中",
            location="倉庫B-2",
            owner_group_id=4,
            approved_leader_id=2,
            note="2脚に軽微な傷あり"
        ),
        ItemModel(
            name="ポータブル発電機",
            category="電源設備",
            status="要メンテ",
            location="倉庫C-2",
            owner_group_id=3,
            approved_leader_id=4,
            note="オイル交換が必要"
        ),
        ItemModel(
            name="救急箱（大）",
            category="医療・安全",
            status="保管中",
            location="管理室",
            owner_group_id=4,
            approved_leader_id=1,
            note="常備薬・消毒液補充済み"
        ),
        ItemModel(
            name="トランシーバー（5台セット）",
            category="通信機器",
            status="保管中",
            location="倉庫C-3",
            owner_group_id=1,
            approved_leader_id=2,
            responsible_scout_id=2,
            note="充電器も完備"
        ),
    ]
    
    db.add_all(sample_items)
    db.commit()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Hello Jumbory API"}


@app.get("/api/items", response_model=List[Item])
def get_items(
    search: Optional[str] = Query(None, description="名前またはカテゴリで検索"),
    status: Optional[str] = Query(None, description="ステータスでフィルタ"),
    db: Session = Depends(get_db)
):
    """備品一覧を取得（検索・フィルタ対応）"""
    query = db.query(ItemModel)
    
    # 検索条件を適用
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ItemModel.name.like(search_filter)) |
            (ItemModel.category.like(search_filter))
        )
    
    # ステータスフィルタを適用
    if status:
        query = query.filter(ItemModel.status == status)
    
    items = query.all()
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


# === Group endpoints ===
@app.get("/api/groups", response_model=List[Group])
def get_groups(db: Session = Depends(get_db)):
    """団一覧を取得"""
    return db.query(GroupModel).all()


@app.get("/api/groups/{group_id}", response_model=Group)
def get_group(group_id: int, db: Session = Depends(get_db)):
    """団の詳細を取得"""
    group = db.query(GroupModel).filter(GroupModel.id == group_id).first()
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@app.post("/api/groups", response_model=Group, status_code=201)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    """新しい団を登録"""
    db_group = GroupModel(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


# === Leader endpoints ===
@app.get("/api/leaders", response_model=List[Leader])
def get_leaders(db: Session = Depends(get_db)):
    """指導者一覧を取得"""
    return db.query(LeaderModel).all()


@app.post("/api/leaders", response_model=Leader, status_code=201)
def create_leader(leader: LeaderCreate, db: Session = Depends(get_db)):
    """新しい指導者を登録"""
    db_leader = LeaderModel(**leader.model_dump())
    db.add(db_leader)
    db.commit()
    db.refresh(db_leader)
    return db_leader


@app.put("/api/leaders/{leader_id}", response_model=Leader)
def update_leader(leader_id: int, leader: LeaderUpdate, db: Session = Depends(get_db)):
    """指導者情報を更新"""
    db_leader = db.query(LeaderModel).filter(LeaderModel.id == leader_id).first()
    if not db_leader:
        raise HTTPException(status_code=404, detail="指導者が見つかりません")
    
    # 更新されたフィールドのみを適用
    update_data = leader.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_leader, field, value)
    
    db.commit()
    db.refresh(db_leader)
    return db_leader


# === Scout endpoints ===
@app.get("/api/scouts", response_model=List[Scout])
def get_scouts(db: Session = Depends(get_db)):
    """スカウト一覧を取得"""
    return db.query(ScoutModel).all()


@app.post("/api/scouts", response_model=Scout, status_code=201)
def create_scout(scout: ScoutCreate, db: Session = Depends(get_db)):
    """新しいスカウトを登録"""
    db_scout = ScoutModel(**scout.model_dump())
    db.add(db_scout)
    db.commit()
    db.refresh(db_scout)
    return db_scout


@app.put("/api/scouts/{scout_id}", response_model=Scout)
def update_scout(scout_id: int, scout: ScoutUpdate, db: Session = Depends(get_db)):
    """スカウト情報を更新"""
    db_scout = db.query(ScoutModel).filter(ScoutModel.id == scout_id).first()
    if not db_scout:
        raise HTTPException(status_code=404, detail="スカウトが見つかりません")
    
    # 更新されたフィールドのみを適用
    update_data = scout.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_scout, field, value)
    
    db.commit()
    db.refresh(db_scout)
    return db_scout


@app.post("/api/scouts/upload-csv", status_code=201)
async def upload_scouts_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """CSVファイルからスカウトデータを一括登録
    
    CSV形式:
    name,name_kana,group_id,grade,rank,gender,patrol
    山田太郎,やまだたろう,1,5,2級,男,イーグル班
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSVファイルをアップロードしてください")
    
    try:
        # CSVファイルを読み込み
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        scouts_created = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # ヘッダーを1行目とする
            try:
                # group_idを整数に変換
                group_id = int(row.get('group_id', ''))
                
                # スカウトデータを作成
                scout = ScoutModel(
                    name=row.get('name', '').strip(),
                    name_kana=row.get('name_kana', '').strip() or None,
                    group_id=group_id,
                    grade=row.get('grade', '').strip() or None,
                    rank=row.get('rank', '').strip() or None,
                    gender=row.get('gender', '').strip() or None,
                    patrol=row.get('patrol', '').strip() or None,
                )
                
                db.add(scout)
                scouts_created += 1
                
            except Exception as e:
                errors.append(f"行 {row_num}: {str(e)}")
        
        # データベースにコミット
        db.commit()
        
        return {
            "message": f"{scouts_created}件のスカウトを登録しました",
            "created": scouts_created,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSVの処理中にエラーが発生しました: {str(e)}")


@app.post("/api/items/upload-csv", status_code=201)
async def upload_items_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """CSVファイルから備品データを一括登録
    
    CSV形式:
    name,category,status,location,owner_group_id,note
    テント,キャンプ用品,保管中,倉庫A-1,1,6人用
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="CSVファイルをアップロードしてください")
    
    try:
        # CSVファイルを読み込み
        contents = await file.read()
        decoded = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        items_created = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):  # ヘッダーを1行目とする
            try:
                # owner_group_idを整数に変換
                owner_group_id = int(row.get('owner_group_id', ''))
                
                # 備品データを作成
                item = ItemModel(
                    name=row.get('name', '').strip(),
                    category=row.get('category', '').strip(),
                    status=row.get('status', '保管中').strip(),
                    location=row.get('location', '').strip(),
                    owner_group_id=owner_group_id,
                    note=row.get('note', '').strip() or None,
                )
                
                db.add(item)
                items_created += 1
                
            except Exception as e:
                errors.append(f"行 {row_num}: {str(e)}")
        
        # データベースにコミット
        db.commit()
        
        return {
            "message": f"{items_created}件の備品を登録しました",
            "created": items_created,
            "errors": errors if errors else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSVの処理中にエラーが発生しました: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

