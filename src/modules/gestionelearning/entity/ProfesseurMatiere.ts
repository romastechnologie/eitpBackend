import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Message } from "./Message";
import { Matiere } from "./Matiere";
import { Professeur } from "./Professeur";



@Entity()
export class ProfesseurMatiere {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Matiere, (matiere) => matiere.professeurMatieres)
    matiere: Matiere

    @ManyToOne(() => Professeur, (professeur) => professeur.professeurMatieres)
    professeur: Professeur

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}