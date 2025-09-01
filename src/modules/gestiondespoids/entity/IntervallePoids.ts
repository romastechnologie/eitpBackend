import { IsNotEmpty } from "class-validator";
import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import bcryptjs = require('bcryptjs');
import { Montant } from "./Montant";

@Entity()
export class IntervallePoids{
    @PrimaryGeneratedColumn()
    id:number

    @Column({default:"activer"})
    etat:string
    
    @Column({nullable:false})
    debutIntervalle:string

    @Column({nullable:false})
    finIntervalle:string

    @Column({nullable:false})
    @IsNotEmpty({message:"Le type est obligatoire"})
    type:number

    @OneToMany(() => Montant, montant => montant.intervallePoids)
    montants: Montant[];
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
    
}