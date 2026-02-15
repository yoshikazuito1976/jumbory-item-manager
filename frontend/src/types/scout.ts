export interface Scout {
  id: number;
  name: string;
  name_kana: string;
  group_id: number;
  grade: string;
  rank: string;
  gender: string;
  patrol: string;
  is_deleted: boolean;
}

export interface ScoutCreate {
  name: string;
  name_kana: string;
  group_id: number;
  grade: string;
  rank: string;
  gender: string;
  patrol: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
}
