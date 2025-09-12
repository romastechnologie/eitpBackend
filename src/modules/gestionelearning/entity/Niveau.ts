
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Inscription } from "./Inscription";
import { FiliereNiveauMatiere } from "./FiliereNiveauMatiere";


@Entity()
export class Niveau {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @OneToMany(() => Inscription, inscription => inscription.niveau)
    inscriptions: Inscription[];

    @OneToMany(() => FiliereNiveauMatiere, filiereNiveauMatiere => filiereNiveauMatiere.niveau)
    filiereNiveauMatieres: FiliereNiveauMatiere[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


