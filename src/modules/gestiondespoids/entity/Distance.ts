import { IsNotEmpty } from "class-validator";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import bcryptjs = require('bcryptjs');
import { Montant } from "./Montant";

@Entity()
export class Distance{
    @PrimaryGeneratedColumn()
    id:number
    
    @Column({nullable:false})
    @IsNotEmpty({message:"Le libellé est obligatoire"})
    libelle:string

    @Column({nullable:false})
    @IsNotEmpty({message:"La distance est obligatoire"})
    distance:string

    @Column({nullable:false})
    @IsNotEmpty({message:"Le type est obligatoire"})
    type:string

    @Column({default:true})
    etat:boolean
    
    @OneToMany(() => Montant, montant => montant.distance)
    montants: Montant[];
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
    
}