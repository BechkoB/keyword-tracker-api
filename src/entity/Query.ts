import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  Index,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Clusters } from "./Clusters";
import { Page } from "./Page";
import { PageData } from "./PageData";
import { QueryData } from "./QueryData";

@Entity()
export class Query extends BaseEntity {
  @Index("idx_query_id")
  @PrimaryGeneratedColumn()
  id: number;

  @Index("idx_query_name")
  @Column({ unique: true })
  name: string;

  @OneToMany(() => QueryData, (data) => data.query, {
    eager: true,
  })
  queries: QueryData[];

  @OneToMany(() => PageData, (data) => data.query)
  pair_data: PageData[];

  @Column({ default: null })
  est_search_volume: number;

  @Column({ default: null })
  typ: string;

  @Column({ default: null })
  relevant: boolean;

  @Column({ name: "esv_date", type: "timestamp", default: null })
  esv_date: Date;

  @ManyToOne(() => Clusters, (cluster) => cluster.queries)
  cluster: Clusters;

  @ManyToOne(() => Page, (page) => page.main_query, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "designated", referencedColumnName: "id" }])
  designated: Page;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
} 