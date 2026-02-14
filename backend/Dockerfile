# Python 3.11ベースイメージ
FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システム依存関係のインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Poetryのインストール
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Poetryの設定（仮想環境を作成しない）
ENV POETRY_VIRTUALENVS_CREATE=false

# 依存関係ファイルをコピー
COPY pyproject.toml poetry.lock ./

# 依存関係をインストール（開発依存関係は除外）
RUN poetry install --no-dev --no-interaction --no-ansi

# アプリケーションコードをコピー
COPY . .

# ポート8001を公開
EXPOSE 8001

# FastAPIアプリケーションを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
