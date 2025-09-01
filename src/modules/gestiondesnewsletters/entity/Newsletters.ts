import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";

@Entity()
export class Newsletters{
    @PrimaryGeneratedColumn()
    id:number    

    @Column({unique: true , nullable:false})
    @IsNotEmpty({message:"L'email est obligatoire"})
    email:string

    @Column({default:false})
    estAbonne:boolean

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}