from pydantic import BaseModel
from typing import Optional


# Category schemas
class CategoryBase(BaseModel):
    name: str
    sort_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# Group schemas
class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class Group(GroupBase):
    id: int

    class Config:
        from_attributes = True


# Leader schemas
class LeaderBase(BaseModel):
    name: str
    group_id: int
    role: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class LeaderCreate(LeaderBase):
    pass


class LeaderUpdate(BaseModel):
    name: Optional[str] = None
    group_id: Optional[int] = None
    role: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class Leader(LeaderBase):
    id: int
    is_deleted: bool

    class Config:
        from_attributes = True


# Scout schemas
class ScoutBase(BaseModel):
    name: str
    name_kana: Optional[str] = None
    group_id: int
    grade: Optional[str] = None
    rank: Optional[str] = None
    gender: Optional[str] = None
    patrol: Optional[str] = None


class ScoutCreate(ScoutBase):
    pass


class ScoutUpdate(BaseModel):
    name: Optional[str] = None
    name_kana: Optional[str] = None
    group_id: Optional[int] = None
    grade: Optional[str] = None
    rank: Optional[str] = None
    gender: Optional[str] = None
    patrol: Optional[str] = None


class Scout(ScoutBase):
    id: int
    is_deleted: bool

    class Config:
        from_attributes = True


# Item schemas
class ItemBase(BaseModel):
    name: str
    category: str
    status: str
    quantity: int = 1
    bring_to_jamboree: bool = False
    location: str
    owner_group_id: int
    approved_leader_id: Optional[int] = None
    responsible_scout_id: Optional[int] = None
    note: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    quantity: Optional[int] = None
    bring_to_jamboree: Optional[bool] = None
    location: Optional[str] = None
    owner_group_id: Optional[int] = None
    approved_leader_id: Optional[int] = None
    responsible_scout_id: Optional[int] = None
    note: Optional[str] = None


class Item(ItemBase):
    id: int
    group: Group
    approved_leader: Optional[Leader] = None
    responsible_scout: Optional[Scout] = None

    class Config:
        from_attributes = True
