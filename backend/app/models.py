from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True, index=True)
    description = Column(String, nullable=True)
    
    # リレーション（逆参照）
    items = relationship("Item", back_populates="group")


class Leader(Base):
    __tablename__ = "leaders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    role = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_deleted = Column(Boolean, nullable=False, default=False)
    
    # リレーション
    group = relationship("Group")
    approved_items = relationship("Item", back_populates="approved_leader")


class Scout(Base):
    __tablename__ = "scouts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    name_kana = Column(String, nullable=True)  # ふりがな
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    grade = Column(String, nullable=True)  # 学年
    rank = Column(String, nullable=True)  # 級（カブ、ボーイ等の進級）
    gender = Column(String, nullable=True)  # 性別
    patrol = Column(String, nullable=True)  # 班名
    is_deleted = Column(Boolean, nullable=False, default=False)
    
    # リレーション
    group = relationship("Group")
    responsible_items = relationship("Item", back_populates="responsible_scout")


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)  # 保管中/貸出中/要メンテ
    quantity = Column(Integer, nullable=False, default=1)
    bring_to_jamboree = Column(Boolean, nullable=False, default=False)
    location = Column(String, nullable=False)
    owner_group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)  # 所有団ID
    approved_leader_id = Column(Integer, ForeignKey("leaders.id"), nullable=True)  # 承認指導者ID
    responsible_scout_id = Column(Integer, ForeignKey("scouts.id"), nullable=True)  # 使用責任スカウトID
    note = Column(String, nullable=True)
    
    # リレーション
    group = relationship("Group", back_populates="items")
    approved_leader = relationship("Leader", back_populates="approved_items")
    responsible_scout = relationship("Scout", back_populates="responsible_items")
