import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm"

@Entity()
export class Keyword extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: number

    @Column()
    keyword: string

    @Column()
    url: string

    @Column()
    clicks: number

    @Column()
    impressions: number

    @Column()
    ctr: number

    @Column()
    position: number

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

}