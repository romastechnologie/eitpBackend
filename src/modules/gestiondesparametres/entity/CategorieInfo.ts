import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Parametre } from "./Parametre";

@Entity()
export class CategorieInfo{
    @PrimaryGeneratedColumn()
    id:number;
   
    @Column({nullable:false})
    @IsNotEmpty({message:"Le libellé est obigatoire"})
    libelle:string;

    @Column({nullable:false})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string

    @Column({default: false})
    statut:boolean;

    @OneToMany(() => Parametre, (parametre) => parametre.categorieInfo)
    parametres: Parametre[]

    @CreateDateColumn()
    createdAt:Timestamp;
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}