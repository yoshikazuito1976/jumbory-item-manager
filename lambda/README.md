# Lambda

AWS Lambda で `backend` の FastAPI アプリを動かすためのエントリポイントです。

## Files

- `handler.py`: Lambda ハンドラー (`handler`)。
- `requirements.txt`: Lambda 配備用の依存関係。

## How it works

`handler.py` は `backend/main.py` の `app` を読み込み、`Mangum` で AWS Lambda イベントを ASGI に変換します。

## Deploy hint

Lambda のハンドラー設定は次を指定します。

- `handler.handler`

依存インストール例:

```bash
cd lambda
mkdir -p package/backend
pip install -r requirements.txt -t ./package
cp handler.py ./package/handler.py
cp ../backend/main.py ./package/backend/main.py
cp -r ../backend/app ./package/backend/app
```

その後、`package/` を zip 化して Lambda にアップロードします。

## CI/CD

リポジトリには `main` への push で Lambda 更新を行う GitHub Actions (`.github/workflows/deploy-lambda.yml`) を追加しています。