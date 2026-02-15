# デプロイメントガイド

Jumbory Item Manager をVercel（フロントエンド）とRender（バックエンド）にデプロイするための手順書です。

## 概要

- **フロントエンド**：Next.js → Vercel
- **バックエンド**：FastAPI → Render
- 本番URL：
  - Frontend: `https://jumbory-item-manager.vercel.app`
  - Backend API: `https://jumbory-api.onrender.com`

---

## バックエンド（Render）のデプロイ

### 1. 事前準備

#### 1.1 Python バージョン指定

`backend/runtime.txt` に以下を記載（Python 3.11指定）：
```
python-3.11
```

#### 1.2 依存関係ファイル

`backend/requirements.txt` に必要なパッケージをリスト化：
```
fastapi
uvicorn[standard]
psycopg2-binary
sqlalchemy
python-dotenv
python-multipart
alembic
```

**重要**：`python-multipart` は CSV アップロード機能に必須。忘れずに含める。

#### 1.3 環境変数の準備

Render で使用する環境変数：
- `DATABASE_URL`: Supabase PostgreSQL 接続文字列
- `ALLOWED_ORIGINS`: CORS許可オリジン（カンマ区切り）

### 2. Renderでのプロジェクト設定

#### 2.1 新規作成

1. Render.com にログイン
2. **+ New** → **Web Service**
3. GitHub リポジトリを接続
4. 以下の設定を入力：
   - **Name**: `jumbory-api`
   - **Region**: Tokyo など
   - **Branch**: `main`
   - **Root Directory**: `backend`（重要）

#### 2.2 Build & Start Commands

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python main.py`
  - または `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 2.3 環境変数設定

**Settings** → **Environment** から以下を追加：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...` |
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://jumbory-item-manager.vercel.app` |

**注意**：`ALLOWED_ORIGINS` は後からフロントエンドのURLで更新します。

### 3. デプロイ実行

1. 設定完了後、**Deploy** をクリック
2. ビルドログを確認
   - `python-multipart` がインストールされているか確認
   - Python 3.11が使用されているか確認
3. `Services` 画面で **Status** が `Live` になれば成功

### 4. 動作確認

```bash
curl https://jumbory-api.onrender.com/
# {"message": "Hello Jumbory API"} が返ってくることを確認
```

---

## フロントエンド（Vercel）のデプロイ

### 1. 事前準備

#### 1.1 API URL環境変数の設定

フロントエンド内の API呼び出しは環境変数 `NEXT_PUBLIC_API_URL` を使用：

```typescript
// src/app/page.tsx など
const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";
```

### 2. Vercelでのプロジェクト設定

#### 2.1 新規作成

1. Vercel.com にログイン
2. **Add New** → **Project**
3. GitHub リポジトリを選択
4. **Configure Project**:
   - **Root Directory**: `frontend`（重要）
   - **Framework Preset**: `Next.js`（自動検出でOK）

#### 2.2 Build & Output Settings

- **Framework Preset**: Next.js
- **Build Command**: デフォルト（`npm run build`）
- **Output Directory**: デフォルト（`.next`）

#### 2.3 環境変数設定

**Settings** → **Environment Variables** から以下を追加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://jumbory-api.onrender.com` |

### 3. デプロイ実行

1. 設定完了後、**Deploy** をクリック
2. ビルドログを確認
   - `frontend` が正しく認識されているか確認
   - ビルド成功（Build Completed）を確認
3. **Visit** ボタンで表示確認

### 4. カスタムドメイン設定（オプション）

デフォルトでは `{project-name}.vercel.app` が割り当てられます。  
カスタムドメイン使用時は **Settings** → **Domains** から設定。

---

## 環境変数の確認・更新

### Render側（バックエンドの CORS）

フロントエンドがデプロイされた後、Render の環境変数を更新：

1. Render → バックエンドプロジェクト → **Settings** → **Environment**
2. `ALLOWED_ORIGINS` を以下のように更新：
   ```
   http://localhost:3000,https://jumbory-item-manager.vercel.app,https://other-vercel-url.vercel.app
   ```
   （複数URL追加時はカンマ区切り）
3. **Save** → サービス再起動

### Vercel側（フロントエンドの API URL）

1. Vercel → フロントエンドプロジェクト → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_API_URL` が `https://jumbory-api.onrender.com` か確認
3. 変更があれば **Redeploy** を実行

---

## 動作確認チェックリスト

### バックエンド

- [ ] `https://jumbory-api.onrender.com/` にアクセスできる
- [ ] JSON レスポンス `{"message": "Hello Jumbory API"}` が返ってくる
- [ ] `/api/items`, `/api/leaders`, `/api/scouts` が GET できる

### フロントエンド

- [ ] `https://jumbory-item-manager.vercel.app/` に表示される
- [ ] 備品一覧（`/`）でデータが表示される
- [ ] 指導者管理（`/leaders`）にアクセスできる
- [ ] スカウト管理（`/scouts`）にアクセスできる
- [ ] ブラウザコンソールに CORS エラーがない

---

## トラブルシューティング

### Renderで Python 3.14 が使われている

**症状**：デプロイ時に `python3.14` が使用される

**解決方法**：
1. `backend/runtime.txt` に `python-3.11` と記載
2. Render で再デプロイ

### Vercel で 404 が出る

**症状**：`https://jumbory-item-manager.vercel.app/` で 404 エラー

**原因と解決**：
1. **Root Directory が設定されていない**  
   → Settings → `Root Directory` を `frontend` に設定
2. **Framework Preset が "Other" になっている**  
   → Framework Preset を `Next.js` に変更
3. → 再デプロイ

### CORS エラーが出る

**症状**：ブラウザコンソールに `CORS policy` エラーが表示される

**解決方法**：
1. Render → Environment Variables で `ALLOWED_ORIGINS` を確認
2. フロントエンドの URL が含まれているか確認
3. 含まれていなければ追加 → Save
4. Render サービスが再起動されるのを待つ
5. Vercel ページを硬更新（Ctrl+Shift+R）

### API が繋がらない

**症状**：`Failed to fetch items` エラー

**確認手順**：
1. `NEXT_PUBLIC_API_URL` が正しく設定されているか
2. Vercel の Environment Variables で値を確認
   - 末尾に空白がないか
   - `https://` で始まっているか
3. Render の `ALLOWED_ORIGINS` にフロントエンド URL が含まれているか
4. 上記確認後、Vercel から Redeploy

---

## ローカル開発での動作確認

デプロイ前に、ローカルで本番に近い環境で確認：

### バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://..."
export ALLOWED_ORIGINS="http://localhost:3000"
python main.py
```

### フロントエンド

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL="http://localhost:8001"
npm run dev
```

---

## デプロイ後の監視

### ログの確認

- **Render**: Web Service → **Logs** で実行ログを確認
- **Vercel**: Deployments → **Logs** でビルド/実行ログを確認

### パフォーマンス

- **Render**: Usage で リソース使用状況を監視
- **Vercel**: Analytics で ページアクセスを確認

---

## 参考リンク

- [Render - Web Services Docs](https://render.com/docs/web-services)
- [Vercel - Deployment Documentation](https://vercel.com/docs)
- [Next.js - Deployment](https://nextjs.org/docs/deployment)
- [FastAPI - Deployment](https://fastapi.tiangolo.com/deployment/)
