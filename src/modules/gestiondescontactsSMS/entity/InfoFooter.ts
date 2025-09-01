import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";



@Entity()
export class InfoFooter{
    @PrimaryGeneratedColumn()
    id:number;

    // @Column({nullable:true})
    // urlImage:string

    @Column('longtext',{nullable:true})
    politiqueCondition:string

    @Column('longtext', {nullable:true})
    expeLivraison:string

    @Column('longtext', {nullable:true})
    politiqueRR:string

    @Column('longtext', {nullable:true})
    quiSommeNous:string

    @Column({nullable:true})
    contact:string
   
    @Column({ default: false })
    statut: boolean;

    @CreateDateColumn()
    createdAt:Timestamp;
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}