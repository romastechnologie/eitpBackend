import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Professeur } from "./Professeur";
import { Note } from "./Note";
import { AnneeAcademique } from "./AnneAcademique";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";


@Entity()
export class Composition {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date est obligatoire" })
    dateCompostion: Date

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le titre est obligatoire" })
    titre: Date

    @ManyToOne(() => Professeur, (professeur) => professeur.compositions)
    professeur: Professeur

    @OneToMany(() => Note, note => note.composition)
    notes: Note[];

    @ManyToOne(() => AnneeAcademique, (annee) => annee.compositions)
    annee: AnneeAcademique

    @ManyToOne(() => FiliereNiveauMatiere, (filiereNiveauMatiere) => filiereNiveauMatiere.compositions)
    filiereNiveauMatiere: FiliereNiveauMatiere

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}