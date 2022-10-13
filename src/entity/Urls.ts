import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Keywords } from "./Keywords";

@Entity()
export class Urls extends BaseEntity {
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

  @Column({ type: "float", default: null })
  position: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;

  @ManyToOne(() => Keywords, (keyword) => keyword.urls)
  keyword: Keywords;
}