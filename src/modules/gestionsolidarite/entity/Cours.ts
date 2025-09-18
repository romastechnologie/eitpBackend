import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { EmploiDuTemps } from "./EmploiDuTemps";
import { Professeur } from "../../gestionelearning/entity/Professeur";
import { Classe } from "./Classe";
import { FiliereNiveauMatiere } from "../../gestionelearning/entity/FiliereNiveauMatiere";

@Entity()
export class Cours {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time', nullable: false })
    @IsNotEmpty({ message: "L'heure de début est obligatoire" })
    heureDebut: string;

    @Column({ type: 'time', nullable: false })
    @IsNotEmpty({ message: "L'heure de fin est obligatoire" })
    heureFin: string;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le jour est obligatoire" })
    jour: string;

    @Column({ default: false })
    estEnLigne: boolean;

    @ManyToOne(() => Classe, classe => classe.cours, { nullable: false })
    classe: Classe;

    @ManyToOne(() => Professeur, professeur => professeur.cours, { nullable: false })
    professeur: Professeur;

    @ManyToOne(() => FiliereNiveauMatiere, fnm => fnm.cours, { nullable: false })
    filiereNiveauMatiere: FiliereNiveauMatiere;

    @ManyToOne(() => EmploiDuTemps, emploiDuTemps => emploiDuTemps.cours, { nullable: false })
    emploiDuTemps: EmploiDuTemps;

    @CreateDateColumn()
    createdAt: Timestamp;
    
    @UpdateDateColumn()
    updatedAt: Timestamp;
    
    @DeleteDateColumn()
    deletedAt: Timestamp;
}

