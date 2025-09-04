
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Composition } from "./Composition";


@Entity()
export class Professeur {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le nom est obligatoire" })
    nom: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le prénom est obligatoire" })
    prenom: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le numéro npi est obligatoire" })
    npi: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "L' email est obligatoire" })
    email: string

    // @Column({ nullable: false })
    // @IsNotEmpty({ message: "Le mot de passe est obligatoire" })
    // password: string

    @Column({ nullable: true })
    dateNaissance: Date

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le numéro 1 est  obligatoire" })
    telProfesseur1: string

    @Column({ nullable: true })
    telProfesseur2: string


    @OneToMany(() => Composition, (composition) => composition.professeur)
    compositions: Composition[];


    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


