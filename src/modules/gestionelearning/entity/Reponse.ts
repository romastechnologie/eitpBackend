import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { PropositionReponse } from "./PropositionReponse";
import { Question } from "./Question";
import { Composition } from "./Composition";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

@Entity()
export class Reponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "Le contenu de la réponse est obligatoire" })
    contenu: string;

    @ManyToOne(() => PropositionReponse, (proposition) => proposition.reponses)
    @JoinColumn()
    proposition: PropositionReponse;

    @ManyToOne(() => Question, (question) => question.reponses)
    @JoinColumn()
    question: Question;

    @ManyToOne(() => Composition, (composition) => composition.reponses)
    @JoinColumn()
    composition: Composition;

    @ManyToOne(() => User, (user) => user.reponses)
    @JoinColumn()
    user: User;

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}