import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { Query } from "./Query";
import { Page } from "./Page";


@Entity()
export class PageData extends BaseEntity {
  @Index("idx_pair_data_id")
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "date_start", type: "timestamp", default: null })
  date_start: Date;

  @Column({ name: "date_end", type: "timestamp", default: null })
  date_end: Date;

  @Column({ default: null })
  clicks: number;

  @Column({ default: null })
  impressions: number;

  @Column({ type: "float", default: null })
  ctr: number;

  @Column({ type: "float", default: null })
  position: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @ManyToOne(() => Query, (query) => query.queries, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "query_id", referencedColumnName: "id" }])
  query: Query;

  @ManyToOne(() => Page, (page) => page.pages, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "page_id", referencedColumnName: "id" }])
  page: Page;
}
