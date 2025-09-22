
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { TypePiece } from "./TypePiece";
import { Etudiant } from "./Etudiant";
import { Professeur } from "./Professeur";



@Entity()
export class Piece {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le numéro est obligatoire" })
    numeroPiece: string

    // @Column({ unique: true, nullable: false })
    // @IsNotEmpty({ message: "Le nom est obligatoire" })
    // nomFichier: string

    @Column({ nullable: true })
    //@IsNotEmpty({ message: "Le lien est obligatoire" })
    urlImage: string

    @ManyToOne(() => TypePiece, (typePiece) => typePiece.pieces)
    @JoinColumn()
    typePiece: TypePiece;

    @ManyToOne(() => Etudiant, (etudiant) => etudiant.pieces)
    @JoinColumn()
    etudiant: Etudiant;

    @ManyToOne(() => Professeur, (professeur) => professeur.pieces)
    @JoinColumn()
    professeur: Professeur;

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


