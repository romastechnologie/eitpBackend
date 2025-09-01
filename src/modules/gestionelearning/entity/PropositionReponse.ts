import { IsNotEmpty, IsBoolean } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Question } from "./Question";
import { Reponse } from "./Reponse";

@Entity()
export class PropositionReponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "Le contenu de la proposition est obligatoire" })
    contenu: string;

    @Column({ default: false })
    @IsBoolean({ message: "La valeur doit être un booléen" })
    estLaBonneReponse: boolean;

    @ManyToOne(() => Question, (question) => question.propositions)
    @JoinColumn()
    question: Question;

    @OneToMany(() => Reponse, (reponse) => reponse.proposition)
    reponses: Reponse[];

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}