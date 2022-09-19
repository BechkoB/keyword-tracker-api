import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm"

@Entity()
export class Keywords extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    id: number

    @Column()
    keyword: string

    @Column()
    url: string

    @Column({ default: null })
    clicks: number

    @Column({default: null})
    impressions: number

    @Column({default: null})
    typ: string

    @Column({default: null})
    suchvolumen: number

    @Column({type: 'double', default: null})
    ctr: number

    @Column({ type: 'double', default: null })
    position: number

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

}