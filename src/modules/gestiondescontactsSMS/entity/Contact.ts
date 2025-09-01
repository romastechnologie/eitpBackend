import { IsEmail } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { CategorieArticle } from "../../gestiondesarticles/entity/CategorieArticle";

@Entity()
export class Contact{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:false})
    nomComplet:string

    @Column({nullable:false})
    telephone:string

    @Column({nullable:true})
    @IsEmail()
    email:string
   
    @Column({nullable:true})
    service: string;

    @Column({nullable:true})
    message: string;

    @ManyToOne(() => CategorieArticle, (categorieArticle) => categorieArticle.contacts)
    categorieArticle: CategorieArticle

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}