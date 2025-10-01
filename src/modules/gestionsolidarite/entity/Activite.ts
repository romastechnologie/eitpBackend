
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Offre } from "./Offre";



@Entity()
export class Activite {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le code est obligatoire" })
    code: string

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le libellé est obligatoire" })
    libelle: string

    @OneToMany(() => Offre, offre => offre.activite)
    offres: Offre[];


    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}


