
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Inscription } from "./Inscription";
import { Note } from "./Note";


@Entity()
export class Etudiant {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le numéro matricule est obligatoire" })
    matricule: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le nom est obligatoire" })
    nom: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le prénom est obligatoire" })
    prenom: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "L' email est obligatoire" })
    email: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le mot de passe est obligatoire" })
    password: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date de naissance est obligatoire" })
    dateNaissance: Date

    @OneToMany(() => Inscription, inscription => inscription.etudiant)
    inscriptions: Inscription[];

    @OneToMany(() => Note, note => note.etudiant)
    notes: Note[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


