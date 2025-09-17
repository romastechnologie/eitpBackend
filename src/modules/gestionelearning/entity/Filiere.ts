import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Inscription } from "./Inscription";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";
import { EmploiDuTemps } from "../../gestionsolidarite/entity/EmploiDuTemps";


@Entity()
export class Filiere {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @OneToMany(() => Inscription, inscription => inscription.filiere)
    inscriptions: Inscription[];

    @OneToMany(() => FiliereNiveauMatiere, filiereNiveauMatiere => filiereNiveauMatiere.filiere)
    filiereNiveauMatieres: FiliereNiveauMatiere[];

    @OneToMany(() => EmploiDuTemps, (emploi) => emploi.filiere)
    emploisDuTemps: EmploiDuTemps[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}