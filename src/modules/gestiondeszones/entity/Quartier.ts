import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Arrondissement } from "./Arrondissement";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { Professeur } from "../../gestionelearning/entity/Professeur";
import { Etudiant } from "../../gestionelearning/entity/Etudiant";
import { Parent } from "../../gestionelearning/entity/Parent";



@Entity('quartier')
export class Quartier {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @ManyToOne(() => Arrondissement, (arrondissement) => arrondissement.quartiers)
    public arrondissement: Arrondissement

    @OneToMany(() => Professeur, professeur => professeur.quartier)
    professeurs: Professeur[];

    @OneToMany(() => Etudiant, etudiant => etudiant.quartier)
    etudiants: Etudiant[];

    @OneToMany(() => Parent, parent => parent.quartier)
    parents: Parent[];

    @ManyToOne(() => User)
    userCreation: User

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
    rapports: any;
}