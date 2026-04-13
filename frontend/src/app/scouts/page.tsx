"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scout, Group } from "@/types/scout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/admin-auth";

export default function ScoutsPage() {
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoutsResponse, groupsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/scouts`),
          fetch(`${API_BASE_URL}/api/groups`),
        ]);

        const scoutsData = scoutsResponse.ok ? await scoutsResponse.json() : [];
        const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];

        setScouts(Array.isArray(scoutsData) ? scoutsData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (error) {
        console.error("スカウトデータの取得に失敗しました:", error);
      }
    };

    fetchData();
  }, []);

  const filteredScouts = scouts.filter((scout) => {
    const matchesSearch =
      scout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.name_kana.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      groupFilter === "all" || scout.group_id === parseInt(groupFilter);
    return matchesSearch && matchesGroup;
  });

  const stats = {
    total: scouts.length,
    byGrade: scouts.reduce((acc, scout) => {
      acc[scout.grade] = (acc[scout.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          ← 備品一覧に戻る
        </Link>
        <Link href="/leaders" className="text-blue-600 hover:underline">
          指導者一覧
        </Link>
        <Link href="/admin/scouts">
          <Button size="sm">管理者画面</Button>
        </Link>
      </div>

      <h1 className="mb-6 text-xl font-bold sm:text-2xl md:text-3xl">スカウト一覧</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>総スカウト数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold sm:text-3xl">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byGrade).map(([grade, count]) => (
          <Card key={grade}>
            <CardHeader>
              <CardTitle>{grade}年生</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold sm:text-3xl">{count}名</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>スカウト一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-4">
            <Input
              placeholder="名前で検索..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
            />
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="団で絞込" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべての団</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>名前</TableHead>
                <TableHead>ふりがな</TableHead>
                <TableHead>所属団</TableHead>
                <TableHead>学年</TableHead>
                <TableHead>級</TableHead>
                <TableHead>性別</TableHead>
                <TableHead>班名</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScouts.map((scout) => {
                const group = groups.find((g) => g.id === scout.group_id);
                return (
                  <TableRow key={scout.id}>
                    <TableCell>{scout.id}</TableCell>
                    <TableCell className="font-medium">{scout.name}</TableCell>
                    <TableCell>{scout.name_kana}</TableCell>
                    <TableCell>{group?.name || "-"}</TableCell>
                    <TableCell>{scout.grade}</TableCell>
                    <TableCell>{scout.rank}</TableCell>
                    <TableCell>{scout.gender}</TableCell>
                    <TableCell>{scout.patrol}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredScouts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">スカウトが見つかりませんでした</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
