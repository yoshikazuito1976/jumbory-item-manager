"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authenticateAdmin,
  clearStoredAdminPassword,
  getStoredAdminPassword,
  storeAdminPassword,
} from "@/lib/admin-auth";

type AdminGateProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminGate({ title, description, children }: AdminGateProps) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedPassword = getStoredAdminPassword();
    setAuthenticated(Boolean(storedPassword));
    setChecking(false);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      await authenticateAdmin(password);
      storeAdminPassword(password);
      setAuthenticated(true);
      setPassword("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "管理者認証に失敗しました",
      );
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearStoredAdminPassword();
    setAuthenticated(false);
    setPassword("");
    setErrorMessage("");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 公開画面に戻る
          </Link>
        </div>

        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="admin-password">パスワード</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="管理者パスワードを入力"
                    required
                  />
                </div>
                {errorMessage ? (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                ) : null}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "認証中..." : "ログイン"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          公開画面
        </Link>
        <Link href="/admin" className="text-blue-600 hover:underline">
          管理者ホーム
        </Link>
        <Link href="/admin/items" className="text-blue-600 hover:underline">
          備品管理
        </Link>
        <Link href="/admin/leaders" className="text-blue-600 hover:underline">
          指導者管理
        </Link>
        <Link href="/admin/scouts" className="text-blue-600 hover:underline">
          スカウト管理
        </Link>
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
      {children}
    </div>
  );
}