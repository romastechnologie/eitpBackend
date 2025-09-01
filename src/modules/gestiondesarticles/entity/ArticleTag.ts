import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, Unique } from "typeorm"
import { Article } from "./Article"
import { Tag } from "../../gestiondesfaqs/entity/Tag"

@Entity()
export class ArticleTag {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    articleId: number

    @Column()
    tagId: number

    @ManyToOne(() => Article, (article) => article.articletags)
    article: Article
    
    @ManyToOne(() => Tag, (tag) => tag.articletags)
    tag: Tag

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}


