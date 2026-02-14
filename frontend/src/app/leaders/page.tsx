"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Leader, LeaderCreate, Group } from "@/types/leader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const API_BASE_URL = "http://127.0.0.1:8001";

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Leader>>({});
  const [formData, setFormData] = useState<LeaderCreate>({
    name: "",
    group_id: 0,
    role: "",
    gender: "",
    phone: "",
    email: "",
  });

  const fetchLeaders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders`);
      const data = await response.json();
      setLeaders(data);
    } catch (error) {
      console.error("指導者の取得に失敗しました:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("団の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchLeaders();
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          name: "",
          group_id: 0,
          role: "",
          gender: "",
          phone: "",
          email: "",
        });
        fetchLeaders();
      }
    } catch (error) {
      console.error("指導者の登録に失敗しました:", error);
    }
  };

  const filteredLeaders = leaders.filter((leader) => {
    const matchesSearch = leader.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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

  const handleEdit = (leader: Leader) => {
    setEditingId(leader.id);
    setEditData(leader);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (leaderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/leaders/${leaderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditingId(null);
        setEditData({});
        fetchLeaders();
      }
    } catch (error) {
      console.error("指導者の更新に失敗しました:", error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← 備品管理に戻る
        </Link>
        <Link href="/scouts" className="text-blue-600 hover:underline">
          スカウト管理
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">指導者管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>総指導者数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byGroup).map(([groupName, count]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle>{groupName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{count}名</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新規指導者登録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="group_id">所属団</Label>
                <Select
                  value={formData.group_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, group_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="団を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">役務</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="例: 団委員長, 隊長, 副長"
                />
              </div>
            </div>
            <Button type="submit">登録</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>指導者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaders.map((leader) => {
                const group = groups.find((g) => g.id === leader.group_id);
                const isEditing = editingId === leader.id;
                return (
                  <TableRow key={leader.id}>
                    <TableCell>{leader.id}</TableCell>
                    <TableCell className="font-medium">{leader.name}</TableCell>
                    <TableCell className="w-32">{group?.name || "-"}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.role || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, role: e.target.value })
                          }
                          className="w-32"
                        />
                      ) : (
                        leader.role || "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(leader.id)}
                          >
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            キャンセル
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => handleEdit(leader)}>
                          編集
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredLeaders.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              指導者が見つかりませんでした
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
