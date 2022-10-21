import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Urls } from "./Urls";

@Entity()
export class Keywords extends BaseEntity {
  @Index("idx_keyword_id")
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index("idx_keyword_name")
  @Column()
  name: string;

  @Column({ default: null, nullable : true })
  designated: string;

  @OneToMany(() => Urls, (url) => url.keyword)
  urls: Urls[];

  @Column({ default: null })
  clicks: number;

  @Column({ default: null })
  impressions: number;

  @Column({ default: null })
  typ: string;

  @Column({ default: null })
  suchvolumen: number;

  @Column({ default: null })
  tracken: boolean;

  @Column({ type: "float", default: null })
  ctr: number;

  @Column({ type: "float", default: null })
  position: number;

  @Index("idx_keyword_craetd_at")
  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
}
