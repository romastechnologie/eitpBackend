import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { TypeMedia } from "./TypeMedia";
import { Article } from "./Article";



@Entity()
export class Media{
    @PrimaryGeneratedColumn()
    id:number

    @Column({ nullable:true})
    @IsNotEmpty({message:"Le type est obligatoire"})
    type:string

    @Column({nullable:true})
    @IsNotEmpty({message:"La description est obligatoire"})
    description:string

    @Column({default:true})
    etat:boolean

    @Column({unique: true, nullable:true})
    @IsNotEmpty({message:"Le nom est obligatoire"})
    name:string

    @Column({ nullable:true})
    @IsNotEmpty({message:"Le type est obligatoire"})
    alternativeText:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le caption est obligatoire"})
    caption:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le width est obligatoire"})
    width:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le height est obligatoire"})
    height:string
    
    @Column({nullable:true})
    @IsNotEmpty({message:"Le format est obligatoire"})
    formats:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le hash est obligatoire"})
    hash:string

    @Column({nullable:true})
    @IsNotEmpty({message:"L'ext est obligatoire"})
    ext:string

    @Column({ nullable:true})
    @IsNotEmpty({message:"Le mime est obligatoire"})
    mime:string
    
    @Column({nullable:true})
    @IsNotEmpty({message:"Le size est obligatoire"})
    size:string

    @Column({nullable:true})
    @IsNotEmpty({message:"L'url est obligatoire"})
    url:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le previewUrl est obligatoire"})
    previewUrl:string

    @Column({ nullable:true})
    @IsNotEmpty({message:"Le providerMeta est obligatoire"})
    provider_metada:string

    @Column({nullable:true})
    @IsNotEmpty({message:"Le provider est obligatoire"})
    provider:string
    
    @ManyToOne(() => TypeMedia, (typeMedia) => typeMedia.medias)
    typeMedia: TypeMedia
    
    @ManyToOne(() => Article, (article) => article.medias)
    article: Article
    

    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}