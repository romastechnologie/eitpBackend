import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { CategorieInfo } from "./CategorieInfo";

@Entity()
export class Parametre{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:false})
    @IsNotEmpty({message:"Le libelle est obligatoire"})
    libelle:string

    @Column({nullable:false})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string

    @ManyToOne(() => CategorieInfo, (categorieInfo) => categorieInfo.parametres)
    categorieInfo: CategorieInfo

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}