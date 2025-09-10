import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Etudiant } from "./Etudiant";
import { AnneeAcademique } from "./AnneAcademique";
import { Filiere } from "./Filiere";
import { Niveau } from "./Niveau";


@Entity()
export class Inscription {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date est obligatoire" })
    dateInscription: Date


    

    @ManyToOne(() => Etudiant, (etudiant) => etudiant.inscriptions)
    etudiant: Etudiant

    @ManyToOne(() => AnneeAcademique, (annee) => annee.inscriptions)
    annee: AnneeAcademique

    @ManyToOne(() => Filiere, (filiere) => filiere.inscriptions)
    filiere: Filiere

    @ManyToOne(() => Niveau, (niveau) => niveau.inscriptions)
    niveau: Niveau

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}