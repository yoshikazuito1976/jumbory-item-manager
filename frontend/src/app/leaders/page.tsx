"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Leader, Group } from "@/types/leader";
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

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadersResponse, groupsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/leaders`),
          fetch(`${API_BASE_URL}/api/groups`),
        ]);

        const leadersData = leadersResponse.ok ? await leadersResponse.json() : [];
        const groupsData = groupsResponse.ok ? await groupsResponse.json() : [];

        setLeaders(Array.isArray(leadersData) ? leadersData : []);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (error) {
        console.error("指導者データの取得に失敗しました:", error);
      }
    };

    fetchData();
  }, []);

  const filteredLeaders = leaders.filter((leader) => {
    const matchesSearch = leader.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      groupFilter === "all" || leader.group_id === parseInt(groupFilter);
    return matchesSearch && matchesGroup;
  });

  const stats = {
    total: leaders.length,
    byGroup: leaders.reduce((acc, leader) => {
      const group = groups.find((g) => g.id === leader.group_id);
      if (group) {
        acc[group.name] = (acc[group.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">
          ← 備品一覧に戻る
        </Link>
        <Link href="/admin/leaders">
          <Button size="sm">管理者画面</Button>
        </Link>
      </div>

      <h1 className="mb-6 text-xl font-bold sm:text-2xl md:text-3xl">指導者一覧</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>総指導者数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold sm:text-3xl">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byGroup).map(([groupName, count]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold sm:text-3xl">{count}名</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>指導者一覧</CardTitle>
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
                <TableHead>所属団</TableHead>
                <TableHead>役務</TableHead>
                <TableHead>性別</TableHead>
                <TableHead>電話</TableHead>
                <TableHead>メール</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaders.map((leader) => {
                const group = groups.find((g) => g.id === leader.group_id);
                return (
                  <TableRow key={leader.id}>
                    <TableCell>{leader.id}</TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell>{group?.name || "-"}</TableCell>
                    <TableCell>{leader.role || "-"}</TableCell>
                    <TableCell>{leader.gender || "-"}</TableCell>
                    <TableCell>{leader.phone || "-"}</TableCell>
                    <TableCell>{leader.email || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredLeaders.length === 0 ? (
            <p className="py-8 text-center text-gray-500">指導者が見つかりませんでした</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
