import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"


@Entity()
export class JournalConnexion {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false})
    entityId: string

    @Column({nullable:false})
    userName: string

    @Column({nullable:false})
    action: string

    @CreateDateColumn()
    createdAt:Date;

}