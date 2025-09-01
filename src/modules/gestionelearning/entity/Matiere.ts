import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";


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

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}