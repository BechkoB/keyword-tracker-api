import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm"

@Entity()
export class Keywords extends BaseEntity {

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

    @Column({default: null})
    typ: number

    @Column({default: null})
    suchvolumen: number

    @Column({type: 'double'})
    ctr: number

    @Column({type: 'double'})
    position: number

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

}