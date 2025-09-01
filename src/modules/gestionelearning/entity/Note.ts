import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Matiere } from "./Matiere";
import { Niveau } from "./Niveau";
import { Filiere } from "./Filiere";
import { Composition } from "./Composition";
import { Etudiant } from "./Etudiant";


@Entity()
export class Note {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La note est obligatoire" })
    note: number
    
    @ManyToOne(() => Composition, (composition) => composition.notes)
    composition: Composition

    @ManyToOne(() => Etudiant, (etudiant) => etudiant.notes)
    etudiant: Etudiant

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}