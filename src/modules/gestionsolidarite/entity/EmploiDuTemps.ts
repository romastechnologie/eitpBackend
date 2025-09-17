import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Cours } from "./Cours";
import { TypeEmploiDuTemps } from "./TypeEmploiDuTemps";


@Entity()
export class EmploiDuTemps {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La date de début est obligatoire" })
    dateDebut: Date;

    @Column({ nullable: false })
    @IsNotEmpty({ message: "La date de fin est obligatoire" })
    dateFin: Date;

    @OneToMany(() => Cours, cours => cours.emploiDuTemps)
    cours: Cours[];

    @ManyToOne(() => TypeEmploiDuTemps, type => type.emploisDuTemps, { nullable: false })
    typeEmploi: TypeEmploiDuTemps;

    @CreateDateColumn()
    createdAt: Timestamp;

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}
