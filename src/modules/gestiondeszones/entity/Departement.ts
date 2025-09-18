import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Commune } from "./Communes";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

@Entity('departement')
export class Departement{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    @IsNotEmpty({ message:"Le code est obligatoire" })
    code:string

    @Column({unique:true, nullable:true})
    @IsNotEmpty({ message:"Le libellé est obligatoire" })
    libelle:string
 
    @OneToMany(()=>Commune, (commune)=>commune.departement)
    communes:Commune[]

    @ManyToOne(()=>User)
    userCreation:User
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}