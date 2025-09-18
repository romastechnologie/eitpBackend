import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Departement } from "./Departement";
import { Arrondissement } from "./Arrondissement";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";


@Entity('commune')
export class Commune {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: true })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ unique: true, nullable: true })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @ManyToOne(() => Departement, (departement) => departement.communes)
    public departement: Departement

    @OneToMany(() => Arrondissement, (arrondissement) => arrondissement.commune)
    arrondissements: Arrondissement[]

    @ManyToOne(() => User)
    userCreation: User

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}