import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Inscription } from "./Inscription";
import { Composition } from "./Composition";


@Entity()
export class AnneeAcademique {
    @PrimaryGeneratedColumn()
    id: number

 @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date de début est obligatoire" })
    datePrerentree: Date

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date de début est obligatoire" })
    dateDebut: Date

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date de fin est obligatoire" })
    dateFin: Date

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @OneToMany(() => Inscription, inscription => inscription.annee)
    inscriptions: Inscription[];

    @OneToMany(() => Composition, composition => composition.annee)
    compositions: Composition[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}