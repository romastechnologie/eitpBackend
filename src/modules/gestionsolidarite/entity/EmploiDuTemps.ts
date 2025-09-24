import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Cours } from "./Cours";
import { TypeEmploiDuTemps } from "./TypeEmploiDuTemps";
import { Filiere } from "../../gestionelearning/entity/Filiere";
import { Niveau } from "../../gestionelearning/entity/Niveau";


@Entity()
export class EmploiDuTemps {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:"date", nullable: false })
    @IsNotEmpty({ message: "La date de début est obligatoire" })
    dateDebut: Date;

    @Column({ type:"date", nullable: false })
    @IsNotEmpty({ message: "La date de fin est obligatoire" })
    dateFin: Date;

    @OneToMany(() => Cours, cours => cours.emploiDuTemps)
    cours: Cours[];

    @ManyToOne(() => TypeEmploiDuTemps, type => type.emploisDuTemps, { nullable: false })
    typeEmploi: TypeEmploiDuTemps;

    @ManyToOne(() => Filiere, (filiere) => filiere.emploisDuTemps, { nullable: false })
    filiere: Filiere;

    @ManyToOne(() => Niveau, (niveau) => niveau.emploisDuTemps, { nullable: false })
    niveau: Niveau;

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}
