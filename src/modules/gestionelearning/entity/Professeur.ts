
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Composition } from "./Composition";
import { Piece } from "./Piece";
import { Cours } from "../../gestionsolidarite/entity/Cours";
import { ProfesseurMatiere } from "./ProfesseurMatiere";
import { Quartier } from "../../gestiondeszones/entity/Quartier";


@Entity()
export class Professeur {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le nom est obligatoire" })
    nom: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le prénom est obligatoire" })
    prenom: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le numéro npi est obligatoire" })
    npi: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "L' email est obligatoire" })
    email: string

    @Column({ nullable: true })
    dateNaissance: Date

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le numéro 1 est  obligatoire" })
    telProfesseur1: string

    @Column({ nullable: true })
    telProfesseur2: string

    @OneToMany(() => ProfesseurMatiere, (professeurMatiere) => professeurMatiere.professeur)
    professeurMatieres: ProfesseurMatiere[]


    @OneToMany(() => Composition, (composition) => composition.professeur)
    compositions: Composition[];

    @OneToMany(() => Piece, piece => piece.professeur)
    pieces: Piece[];

    @OneToMany(() => Cours, cours => cours.professeur)
    cours: Cours[];

    @ManyToOne(() => Quartier, quartier => quartier.professeurs)
    quartier: Quartier;

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


