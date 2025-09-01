import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Faq } from "./Faq";


@Entity()
export class CategorieFaq{
    @PrimaryGeneratedColumn()
    id:number
   
    @Column({nullable:false})
    @IsNotEmpty({message:"Le code est obligatoire"})
    code:string

    @Column({nullable:false})
    @IsNotEmpty({message:"Le nom est obligatoire"})
    nom:string

    @Column({nullable:false})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string

    @Column({default: false})
    statut:boolean
   
    @OneToMany(() => Faq, (faq) => faq.categorieFaq)
    faqs: Faq[]    
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}