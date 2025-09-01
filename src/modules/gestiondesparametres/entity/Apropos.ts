import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";



@Entity()
export class Apropos{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:true})
    urlImage:string

    @Column('longtext',{nullable:false})
    @IsNotEmpty({message:"La vision est obligatoire"})
    vision:string

    @Column('longtext')
    //@IsNotEmpty({message:"La valeur est obligatoire"})
    valeur:string

    @Column('longtext')
    //@IsNotEmpty({message:"La valeur est obligatoire"})
    mentionLegale:string

    @Column('longtext')
    //@IsNotEmpty({message:"La valeur est obligatoire"})
    donnePersonnelle:string

    @Column('longtext')
    //@IsNotEmpty({message:"La valeur est obligatoire"})
    cookie:string

    @Column('longtext', {nullable:false})
    @IsNotEmpty({message:"La mission est obligatoire"})
    mission:string

    @Column('longtext', {nullable:false})
    @IsNotEmpty({message:"L'historique est obligatoire"})
    historique:string

    @Column({nullable:true})
    organigramme:string
    
    @Column('longtext', {nullable:false})
    @IsNotEmpty({message:"L'annonce est obligatoire"})
    annoncedg:string
   
    @Column({ default:false})
    statut: boolean;

    @Column({default:0})
    nbVisite:number

    @CreateDateColumn()
    createdAt:Timestamp;
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}