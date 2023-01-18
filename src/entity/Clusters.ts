import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Query } from "./Query";

@Entity()
export class Clusters extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToOne(() => Clusters, (cluster) => cluster.children, {
    nullable: true,
    cascade: true,
    onDelete: "CASCADE",
  })
  parent: Clusters;

  @OneToMany(() => Clusters, (cluster) => cluster.parent)
  children: Clusters[];

  @OneToMany(() => Query, (query) => query.cluster, {
    cascade: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  queries: Query[];

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  created_at: Date;
}
