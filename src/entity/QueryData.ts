import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Query } from "./Query";

@Entity()
export class QueryData extends BaseEntity {
  @Index("idx_query_data_id")
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "date_start", type: "timestamp", default: null })
  date_start: Date;

  @Column({ name: "date_end", type: "timestamp", default: null })
  date_end: Date;

  @ManyToOne(() => Query, (query) => query.queries)
  @JoinColumn([{ name: "query_id", referencedColumnName: "id" }])
  query: Query;

  @Column({ default: null })
  clicks: number;

  @Column({ default: null })
  typ: string;

  @Column({ default: null })
  impressions: number;

  @Column({ default: null })
  suchvolumen: number;

  @Column({ default: null })
  tracken: number;

  @Column({ type: "float", default: null })
  ctr: number;

  @Column({ type: "float", default: null })
  position: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
}
