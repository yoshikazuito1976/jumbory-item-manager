"use client";

import Link from "next/link";
import { AdminGate } from "@/components/admin-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    href: "/admin/items",
    title: "備品管理",
    description: "備品の登録、編集、削除、写真更新を行います。",
  },
  {
    href: "/admin/leaders",
    title: "指導者管理",
    description: "指導者の登録、編集、削除、復元を行います。",
  },
  {
    href: "/admin/scouts",
    title: "スカウト管理",
    description: "スカウトの登録、CSV取込、編集、削除、復元を行います。",
  },
];

export default function AdminHomePage() {
  return (
    <AdminGate
      title="管理者画面"
      description="編集や削除を行うには管理者パスワードでログインしてください。"
    >
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">管理者ホーム</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          公開画面は閲覧専用です。更新作業はここから各管理画面へ進んでください。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.href}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{section.description}</p>
              <Link href={section.href}>
                <Button className="w-full">開く</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminGate>
  );
}