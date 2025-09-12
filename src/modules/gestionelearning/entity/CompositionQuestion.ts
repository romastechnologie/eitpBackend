import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Composition } from "./Composition";
import { Question } from "./Question";


@Entity()
export class CompositionQuestion {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    estActif: boolean

    @ManyToOne(() => Composition, (composition) => composition.compoQuestions)
    composition: Composition

    @ManyToOne(() => Question, (question) => question.compoQuestions)
    question: Question

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}