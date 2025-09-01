import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"


@Entity()
export class JournalOperation {
    
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false})
    entityName: string

    @Column({nullable:false})
    userId: number

    @Column({nullable:true})
    userName: string

    @Column({nullable:false})
    entityId: string

    @Column({nullable:false})
    action: string

    @Column({nullable:false})
    addressMac: string

    @Column({nullable:false})
    addressIP: string

    @Column({ type: 'json', nullable: true })
    contenu: any;

    @CreateDateColumn()
    createdAt:Date;

}