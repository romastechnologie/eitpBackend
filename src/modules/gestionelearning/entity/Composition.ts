import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Professeur } from "./Professeur";
import { Note } from "./Note";
import { AnneeAcademique } from "./AnneAcademique";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";
import { CompositionQuestion } from "./CompositionQuestion";
import { Reponse } from "./Reponse";


@Entity()
export class Composition {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La date est obligatoire" })
    dateComposition: Date

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le titre est obligatoire" })
    titre: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le type de la question est obligatoire" })
    type: string;

    @ManyToOne(() => Professeur, (professeur) => professeur.compositions)
    professeur: Professeur

    @OneToMany(() => Note, note => note.composition)
    notes: Note[];

    @ManyToOne(() => AnneeAcademique, (annee) => annee.compositions)
    annee: AnneeAcademique

     @ManyToOne(() => FiliereNiveauMatiere, (filiereNiveauMatiere) => filiereNiveauMatiere.compositions)
    @JoinColumn({ name: 'filiereNiveauMatiereId' }) 
    filiereNiveauMatiere: FiliereNiveauMatiere

    @Column({ nullable: true })
    filiereNiveauMatiereId: number


    @OneToMany(() => CompositionQuestion, compoQuestion => compoQuestion.composition)
    compoQuestions: CompositionQuestion[];

    @OneToMany(() => Reponse, reponse => reponse.composition)
    reponses: Reponse[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


