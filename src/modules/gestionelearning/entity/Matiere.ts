import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";
import { Professeur } from "./Professeur";
import { ProfesseurMatiere } from "./ProfesseurMatiere";


@Entity()
export class Matiere {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @OneToMany(() => FiliereNiveauMatiere, filiereNiveauMatiere => filiereNiveauMatiere.matiere)
    filiereNiveauMatieres: FiliereNiveauMatiere[];

    @OneToMany(() => ProfesseurMatiere, (professeurMatiere) => professeurMatiere.matiere)
    professeurMatieres: ProfesseurMatiere[]

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}