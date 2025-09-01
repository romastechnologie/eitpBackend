import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Matiere } from "./Matiere";
import { Niveau } from "./Niveau";
import { Filiere } from "./Filiere";
import { Composition } from "./Composition";
import { Question } from "./Question";


@Entity()
export class FiliereNiveauMatiere {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le coefficient est obligatoire" })
    coefficient: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le statut est obligatoire" })
    statut: boolean

    @ManyToOne(() => Filiere, (filiere) => filiere.filiereNiveauMatieres)
    filiere: Filiere

    @ManyToOne(() => Niveau, (niveau) => niveau.filiereNiveauMatieres)
    niveau: Niveau

    @ManyToOne(() => Matiere, (matiere) => matiere.filiereNiveauMatieres)
    matiere: Matiere

    @OneToMany(() => Composition, composition => composition.filiereNiveauMatiere)
    compositions: Composition[];

    @ManyToOne(() => Question, (question) => question.filiereNiveauMatieres)
    question: Question

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}