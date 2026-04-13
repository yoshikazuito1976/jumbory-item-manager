# Jumbory Backend

FastAPI backend for the Jumbory item manager.

## Admin Authentication

更新系 API はすべて管理者パスワードで保護されています。起動前に `ADMIN_PASSWORD` を設定してください。

```bash
export ADMIN_PASSWORD='your-admin-password'
```

フロントエンドの管理者画面は `POST /api/admin/auth` でパスワード確認を行い、その後は `X-Admin-Password` ヘッダー付きで更新系 API を呼び出します。
