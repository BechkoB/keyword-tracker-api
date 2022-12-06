import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  Index,
  OneToMany,
  OneToOne,
} from "typeorm";
import { PageData } from "./PageData";
import { Query } from "./Query";

@Entity()
export class Page extends BaseEntity {
  @Index("idx_page_id")
  @PrimaryGeneratedColumn()
  id: number;

  @Index("idx_page_name")
  @Column({ unique: true })
  name: string;

  @OneToMany(() => PageData, (data) => data.page)
  pages: PageData[];

  @OneToMany(() => Query, (query) => query.designated)
  main_query: Query;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
}
