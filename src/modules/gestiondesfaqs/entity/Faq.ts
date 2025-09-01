import { IsNotEmpty } from "class-validator";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import bcryptjs = require('bcryptjs');
import { CategorieFaq } from "./CategorieFaq";
import { FaqTag } from "./FaqTag";

@Entity()
export class Faq{
    @PrimaryGeneratedColumn()
    id:number

    @Column('longtext', {nullable:false})
    question:string
    
    @Column('longtext', {nullable:false})
    reponse:string

    @Column({default:true})
    statut:boolean
    
    @OneToMany(() => FaqTag, faqtag => faqtag.faq)
    faqtags: FaqTag[];
    
    @ManyToOne(() => CategorieFaq, (categorieFaq) => categorieFaq.faqs)
    categorieFaq: CategorieFaq

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
    
}