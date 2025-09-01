import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp } from "typeorm"
import { FaqTag } from "./FaqTag"
import { ArticleTag } from "../../gestiondesarticles/entity/ArticleTag"

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false, unique: true})
    nom: string

    @Column({nullable:true})
    info: string

    @Column({default:"activer"})
    etat:string

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
    
    @OneToMany(() => FaqTag, faqtag => faqtag.tag)
    faqtags: FaqTag[];

    @OneToMany(() => ArticleTag, articletag => articletag.tag)
    articletags: ArticleTag[];

}