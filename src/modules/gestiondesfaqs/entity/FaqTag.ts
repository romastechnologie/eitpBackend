import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, Unique } from "typeorm"
import { Faq } from "./Faq"
import { Tag } from "./Tag"

@Entity()
export class FaqTag {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    faqId: number

    @Column()
    tagId: number

    @ManyToOne(() => Faq, (faq) => faq.faqtags)
    faq: Faq
    
    @ManyToOne(() => Tag, (tag) => tag.faqtags)
    tag: Tag

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}


