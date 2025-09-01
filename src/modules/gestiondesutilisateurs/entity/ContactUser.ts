import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, Unique } from "typeorm"
import { Permission } from "./permission.entity"
import { Role } from "./role.entity"
import { User } from "./user.entity"

import { IsEmpty, IsNotEmpty } from "class-validator"

@Entity()
@Unique(["numero"])
export class ContactUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false})
    @IsNotEmpty({message:"Le numéro n'est pas renseigné"})
    numero: string

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}


