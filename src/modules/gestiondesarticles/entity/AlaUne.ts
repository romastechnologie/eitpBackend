import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Media } from "./Media";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";

@Entity()
export class AlaUne{
    @PrimaryGeneratedColumn()
    id:number    

    @Column({unique: true, nullable:false})
    @IsNotEmpty({message:"Le titre est obligatoire"})
    titre:string
    
    @Column({nullable:false})
    @IsNotEmpty({message:"Le sous titre est obligatoire"})
    subtitle:string

    @Column({nullable:true})
    urlImage:string

    @Column('longtext', {nullable:false})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string
    
    @Column({default:true})
    statut:boolean

    @Column({nullable:true})
    link:string
   
    // @OneToMany(() => Media, (media) => media.article)
    // medias: Media[]
    
    // @ManyToOne(()=>User, (user)=>user.articles)
    // @JoinColumn()
    // user:User
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}