"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Scout, ScoutCreate, Group } from "@/types/scout";
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

export default function ScoutsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Scout>>({});
  const [formData, setFormData] = useState<ScoutCreate>({
    name: "",
    name_kana: "",
    group_id: 0,
    grade: "",
    rank: "",
    gender: "",
    patrol: "",
  });
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("scouts_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "19nsj@saitama7tai") {
      setIsAuthenticated(true);
      sessionStorage.setItem("scouts_authenticated", "true");
    } else {
      alert("パスワードが正しくありません");
      setPassword("");
    }
  };

  const fetchScouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scouts`);
      const data = await response.json();
      setScouts(data);
    } catch (error) {
      console.error("スカウトの取得に失敗しました:", error);
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
    fetchScouts();
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/scouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({
          name: "",
          name_kana: "",
          group_id: 0,
          grade: "",
          rank: "",
          gender: "",
          patrol: "",
        });
        fetchScouts();
      }
    } catch (error) {
      console.error("スカウトの登録に失敗しました:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/scouts/upload-csv`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setUploadMessage(result.message || "アップロード完了");
      fetchScouts();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("CSVアップロードに失敗しました:", error);
      setUploadMessage("アップロードに失敗しました");
    }
  };

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

  const handleEdit = (scout: Scout) => {
    setEditingId(scout.id);
    setEditData(scout);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = async (scoutId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scouts/${scoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setEditingId(null);
        setEditData({});
        fetchScouts();
      }
    } catch (error) {
      console.error("スカウトの更新に失敗しました:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← 備品管理に戻る
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>スカウトページ - パスワード認証</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">パスワード</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="パスワードを入力"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  ログイン
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6 flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">
          ← 備品管理に戻る
        </Link>
        <Link href="/leaders" className="text-blue-600 hover:underline">
          指導者管理
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">スカウト管理</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>総スカウト数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        {Object.entries(stats.byGrade).map(([grade, count]) => (
          <Card key={grade}>
            <CardHeader>
              <CardTitle>{grade}年生</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{count}名</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSVアップロード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              CSVフォーマット: name,name_kana,group_id,grade,rank,gender,patrol
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadMessage && (
              <p className="text-sm text-green-600">{uploadMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>新規スカウト登録</CardTitle>
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
                <Label htmlFor="name_kana">ふりがな</Label>
                <Input
                  id="name_kana"
                  value={formData.name_kana}
                  onChange={(e) =>
                    setFormData({ ...formData, name_kana: e.target.value })
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
                <Label htmlFor="grade">学年</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, grade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="学年を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="中1">中1</SelectItem>
                    <SelectItem value="中2">中2</SelectItem>
                    <SelectItem value="中3">中3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rank">級</Label>
                <Input
                  id="rank"
                  value={formData.rank}
                  onChange={(e) =>
                    setFormData({ ...formData, rank: e.target.value })
                  }
                  placeholder="例: 1級, 2級, 初級"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">性別</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="性別を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男</SelectItem>
                    <SelectItem value="女">女</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patrol">班名</Label>
                <Input
                  id="patrol"
                  value={formData.patrol}
                  onChange={(e) =>
                    setFormData({ ...formData, patrol: e.target.value })
                  }
                  placeholder="例: イーグル班"
                  required
                />
              </div>
            </div>
            <Button type="submit">登録</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>スカウト一覧</CardTitle>
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
                <TableHead>ふりがな</TableHead>
                <TableHead>所属団</TableHead>
                <TableHead>学年</TableHead>
                <TableHead>級</TableHead>
                <TableHead>性別</TableHead>
                <TableHead>班名</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScouts.map((scout) => {
                const group = groups.find((g) => g.id === scout.group_id);
                const isEditing = editingId === scout.id;
                return (
                  <TableRow key={scout.id}>
                    <TableCell>{scout.id}</TableCell>
                    <TableCell className="font-medium">{scout.name}</TableCell>
                    <TableCell>{scout.name_kana}</TableCell>
                    <TableCell>{group?.name || "-"}</TableCell>
                    <TableCell>{scout.grade}</TableCell>
                    <TableCell>{scout.rank}</TableCell>
                    <TableCell>{scout.gender}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editData.patrol || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, patrol: e.target.value })
                          }
                          className="w-32"
                        />
                      ) : (
                        scout.patrol
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(scout.id)}
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
                        <Button size="sm" onClick={() => handleEdit(scout)}>
                          編集
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredScouts.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              スカウトが見つかりませんでした
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
