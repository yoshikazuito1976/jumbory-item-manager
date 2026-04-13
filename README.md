# Jumbory Item Manager

Jumbory (ジャンボリー) の備品管理アプリ用リポジトリです。

## Structure

- backend/: FastAPI (Poetry)
- frontend/: Next.js App Router + Tailwind CSS + shadcn/ui (npm)
- lambda/: AWS Lambda エントリポイント (Mangum)
- docs/: 設計書や API 仕様書 (Markdown)

## Backend

更新系 API は管理者パスワードで保護されています。バックエンド起動前に環境変数 `ADMIN_PASSWORD` を設定してください。

```bash
export ADMIN_PASSWORD='your-admin-password'
```

### ローカル実行

```bash
cd backend
poetry install
poetry run uvicorn main:app --reload
```

### Docker実行

```bash
# バックエンドのみ
cd backend
docker build -t jumbory-backend .
docker run -p 8001:8001 jumbory-backend

# または docker-compose を使用（推奨）
docker-compose up
```

`GET /` returns `{"message": "Hello Jumbory API"}`.

主な管理者向け API:

- `POST /api/admin/auth`: 管理者パスワードの確認
- `POST/PUT/DELETE /api/items*`: 備品の登録・更新・削除・画像更新
- `POST/PUT/DELETE /api/leaders*`: 指導者の登録・更新・削除・復元
- `POST/PUT/DELETE /api/scouts*`: スカウトの登録・更新・削除・復元・CSV取込

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to see the Next.js starter screen.

公開画面は閲覧専用です。編集や削除を行う場合は http://localhost:3000/admin から管理者画面に入り、管理者パスワードで認証してください。

## Lambda

`backend/main.py` の `app` を AWS Lambda で動かすためのエントリポイントを `lambda/` に配置しています。

```bash
cd lambda
pip install -r requirements.txt -t ./package
cp handler.py ./package/
```

Lambda ハンドラーは `handler.handler` を指定してください。

### GitHub Push で自動デプロイ

`main` ブランチへの push 時に Lambda へ反映する Workflow を追加済みです。

- Workflow: `.github/workflows/deploy-lambda.yml`

GitHub リポジトリの Secrets に次を設定してください。

- `AWS_IAM_ROLE_ARN`: GitHub Actions から Assume する IAM Role ARN
- `AWS_REGION`: 例 `ap-northeast-1`
- `AWS_LAMBDA_FUNCTION_NAME`: 更新対象の Lambda 関数名

この Workflow は OIDC を使う前提です。対象 IAM Role 側で GitHub の OIDC プロバイダを信頼し、`lambda:UpdateFunctionCode` など必要最小限の権限を付与してください。

## Docs

設計書や API 仕様書は docs/ に追加してください。

- [コード説明書](docs/overview.md): 全体構成と技術スタック
- [データの流れ](docs/data_flow.md): フロントエンドからバックエンド、DBまでのデータフロー（Mermaid シーケンス図）
- [実装ログ](docs/implementation_log.md): 備品管理機能の実装内容と動作確認結果（2026/2/14）
- [Lambda OIDC 作業ログ](docs/aws_lambda_oidc_deploy_log.md): AWS Lambda + GitHub Actions (OIDC) の運用者向け設定ログ（2026/2/21）
