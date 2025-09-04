import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

import { PropositionReponse } from "./PropositionReponse";
import { Reponse } from "./Reponse";
import { CompositionQuestion } from "./CompositionQuestion";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";


@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "Le contenu est obligatoire" })
    contenu: string;

    @Column({ nullable: true })
    @IsNotEmpty({ message: "Le type est obligatoire" })
    type: string;

    @Column({ nullable: true }) 
    reponse?: string;

    @ManyToOne(() => User)
    userCreation: User;

    @OneToMany(() => PropositionReponse, (proposition) => proposition.question)
    propositions: PropositionReponse[];

    @OneToMany(() => CompositionQuestion, (compoQuestion) => compoQuestion.question)
    compoQuestions: CompositionQuestion[];

    @OneToMany(() => Reponse, (reponse) => reponse.question)
    reponses: Reponse[];

    @OneToMany(() => FiliereNiveauMatiere, (filiereNiveauMatiere) => filiereNiveauMatiere.question)
    filiereNiveauMatieres: FiliereNiveauMatiere[];


    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}