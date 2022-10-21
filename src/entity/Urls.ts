import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Keywords } from "./Keywords";

@Entity()
export class Urls extends BaseEntity {
  @Index("idx_urls_id")
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ default: null })
  clicks: number;

  @Column({ default: null })
  impressions: number;

  @Column({ type: "float", default: null })
  ctr: number;

  @Column({ default: null })
  typ: string;

  @Column({ type: "float", default: null })
  position: number;

  @Index("idx_urls_created_at")
  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @Index("idx_urls_keyword")
  @ManyToOne(() => Keywords, (keyword) => keyword.urls)
  keyword: Keywords;
}