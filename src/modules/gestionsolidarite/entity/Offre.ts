
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { CategorieOffre } from "./CategorieOffre";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";



@Entity()
export class Offre {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "Le titre est obligatoire" })
    titre: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La description est obligatoire" })
    description: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La description est obligatoire" })
    salaire: number

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La date de publication est obligatoire" })
    datePublication: string

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La date  d'expiration est obligatoire" })
    dateExpiration: string

    @ManyToOne(() => CategorieOffre, (categorieOffre) => categorieOffre.offres)
    categorieOffre: CategorieOffre

    @ManyToOne(() => User)
    userCreation: User


    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


