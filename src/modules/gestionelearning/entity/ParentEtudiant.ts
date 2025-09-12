import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";


import { Parent } from "./Parent";
import { Etudiant } from "./Etudiant";


@Entity()
export class ParentEtudiant {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Parent, (parent) => parent.parentetudiants)
    parent: Parent

    @ManyToOne(() => Etudiant, (etudiant) => etudiant.parentetudiants)
    etudiant: Etudiant

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}