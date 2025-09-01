
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
    @IsNotEmpty({ message: "L' email est obligatoire" })
    email: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le mot de passe est obligatoire" })
    password: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "La date de naissance est obligatoire" })
    dateNaissance: Date

    @OneToMany(() => Composition, (composition) => composition.professeur)
    compositions: Composition[];


    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


