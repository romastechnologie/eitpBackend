import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Media } from "./Media";


@Entity()
export class TypeMedia{
    @PrimaryGeneratedColumn()
    id:number

    @Column({unique: true, nullable:false})
    @IsNotEmpty({message:"Le code est obligatoire"})
    nom:string

    @Column({unique: true, nullable:false})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string

    @Column({nullable:true})
    info:string
   
    @Column({default:true})
    statut:boolean
   
    @OneToMany(() => Media, (media) => media.typeMedia)
    medias: Media[]
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}