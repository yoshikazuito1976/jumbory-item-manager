# 実装ログ: 備品管理機能

**実装日**: 2026年2月14日

## 実装内容

Jumbory 備品管理アプリの主要機能を実装しました。SQLite を使用したデータベース連携と、CRUD 操作が可能な Web インターフェースを構築しました。

## Backend 実装

### 追加した依存関係

- `sqlalchemy ^2.0.46` - ORM（データベース操作）
- `pydantic ^2.0.0` - データ検証とスキーマ定義

### ファイル構成

```
backend/
├── app/
│   ├── __init__.py
│   ├── database.py      # データベース接続設定
│   ├── models.py        # SQLAlchemy モデル定義
│   └── schemas.py       # Pydantic スキーマ定義
├── main.py              # FastAPI アプリ本体（CRUD エンドポイント）
└── jumbory.db          # SQLite データベースファイル（自動生成）
```

### Item モデル

[backend/app/models.py](../backend/app/models.py)

```python
class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)        # 備品名
    category = Column(String, nullable=False)                 # カテゴリ
    status = Column(String, nullable=False)                   # 保管中/貸出中/要メンテ
    location = Column(String, nullable=False)                 # 保管場所
    note = Column(String, nullable=True)                      # 備考
```

### API エンドポイント

[backend/main.py](../backend/main.py)

| メソッド | パス | 説明 |
|---------|------|------|
| `GET` | `/api/items` | 備品一覧を取得 |
| `GET` | `/api/items/{id}` | 備品の詳細を取得 |
| `POST` | `/api/items` | 新しい備品を登録 |
| `PUT` | `/api/items/{id}` | 備品を更新 |
| `DELETE` | `/api/items/{id}` | 備品を削除 |

### 初期データ投入

アプリ起動時（`@app.on_event("startup")`）に以下のサンプルデータを自動投入:

1. テント（6人用）- 保管中
2. 寝袋（冬季用）- 貸出中
3. ガスコンロ（2口）- 要メンテ

### CORS 設定

フロントエンド（localhost:3000）からのアクセスを許可:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Frontend 実装

### 追加した shadcn/ui コンポーネント

```bash
npx shadcn@latest add table button input label card
```

- `table` - 備品一覧表示
- `button` - 登録・削除ボタン
- `input` - フォーム入力
- `label` - フォームラベル
- `card` - コンテンツカード

### ファイル構成

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx         # メインページ（Client Component）
│   │   └── layout.tsx       # レイアウト（メタデータ更新）
│   ├── components/ui/       # shadcn/ui コンポーネント
│   │   ├── table.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── card.tsx
│   └── types/
│       └── item.ts          # Item 型定義
```

### Client Component の実装

[frontend/src/app/page.tsx](../frontend/src/app/page.tsx)

**重要ポイント**:

1. **`"use client"` ディレクティブ**: ブラウザ側で実行される Client Component として定義
2. **`useState`**: フォームデータと備品一覧の状態管理
3. **`useEffect`**: コンポーネントマウント時に API を呼び出してデータ取得

```tsx
"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  // 初回ロード時に備品一覧を取得
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const response = await fetch(`${API_BASE_URL}/api/items`);
    const data = await response.json();
    setItems(data);
    setLoading(false);
  };
  
  // ...
}
```

### 実装した機能

1. **備品一覧表示**: テーブル形式で表示、ステータスに応じて色分け
2. **新規登録フォーム**: 備品名、カテゴリ、ステータス、保管場所、備考を入力
3. **削除機能**: 確認ダイアログ付き
4. **リアルタイム更新**: 登録/削除後に一覧を再取得

### UI の特徴

- ステータス表示:
  - `保管中` → 緑色バッジ
  - `貸出中` → 青色バッジ
  - `要メンテ` → 赤色バッジ
- レスポンシブデザイン（Tailwind CSS）
- shadcn/ui による統一感のある UI

## 動作確認

### Backend API テスト

```bash
# 一覧取得
$ curl http://127.0.0.1:8001/api/items
[
  {"id": 1, "name": "テント（6人用）", "category": "テント", "status": "保管中", ...},
  {"id": 2, "name": "寝袋（冬季用）", "category": "寝具", "status": "貸出中", ...},
  {"id": 3, "name": "ガスコンロ（2口）", "category": "調理器具", "status": "要メンテ", ...}
]

# 新規登録
$ curl -X POST http://127.0.0.1:8001/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"ランタン（LED）","category":"照明器具","status":"保管中","location":"倉庫C-1",...}'
{"id": 4, "name": "ランタン（LED）", ...}
```

### 確認結果

- ✅ 初期データ3件が自動投入
- ✅ 一覧取得 API が正常動作
- ✅ 新規登録 API が正常動作（テスト用に4件目を追加成功）
- ✅ フロントエンドが正常に起動し、API と連携
- ✅ テーブル表示、フォーム送信、削除機能すべて動作確認

## データフロー

```
ユーザー → ブラウザ → Next.js (Client Component)
                ↓ useEffect + fetch
            FastAPI Backend (/api/items)
                ↓ SQLAlchemy ORM
            SQLite (jumbory.db)
```

詳細は [data_flow.md](data_flow.md) を参照。

## 起動方法

### Backend

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

→ http://127.0.0.1:8001 で API が起動

### Frontend

```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:3000 でアプリにアクセス

## 今後の拡張予定

- [ ] 備品の編集機能（PUT エンドポイント活用）
- [ ] 検索・フィルタ機能
- [ ] ページネーション
- [ ] 画像アップロード機能
- [ ] CSV エクスポート機能
- [ ] ユーザー認証・権限管理

## 参考リンク

- [FastAPI 公式ドキュメント](https://fastapi.tiangolo.com/)
- [SQLAlchemy 公式ドキュメント](https://www.sqlalchemy.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
