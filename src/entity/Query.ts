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
} from "typeorm";
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

  @OneToMany(() => QueryData, (data) => data.query)
  queries: QueryData[];

  @OneToMany(() => PageData, (data) => data.query)
  pair_data: QueryData[];

  @Column({ nullable: true })
  est_search_volume: number;

  @Column({ nullable: true })
  typ: string;

  @Column({ nullable: true })
  tracken: boolean;

  @Column({ name: "esv_date", type: "timestamp", nullable: true })
  esv_date: Date;

  @OneToOne(() => Page, (page) => page.main_query)
  @JoinColumn([{ name: "designated", referencedColumnName: "id" }])
  designated: Page;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
} 