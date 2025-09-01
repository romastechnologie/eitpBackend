import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Media } from "./Media";
import { Article } from "./Article";
import { Contact } from "../../gestiondescontactsSMS/entity/Contact";


@Entity()
export class CategorieArticle{
    @PrimaryGeneratedColumn()
    id:number

    @Column({unique: true, nullable:false})
    @IsNotEmpty({message:"Le nom est obligatoire"})
    nom:string

    @Column({nullable:true})
    lienExterne:string

    @Column({nullable:false})
    typeCategorie:string
    
    // @Column({unique: true, nullable:false})
    // @IsNotEmpty({message:"Le code est obligatoire"})
    // code:string

    @Column({nullable:true})
    description:string
    
    @Column({nullable:true})
    urlImage:string

    @Column({default:true})
    statut:boolean

    @Column()
    isService:string
   
    @OneToMany(() => Media, (media) => media.typeMedia)
    medias: Media[]

    @OneToMany(() => Article, (article) => article.categorieArticle)
    articles: Article[]
    
    @ManyToOne(()=>CategorieArticle, (categorieArticle)=>categorieArticle.sousCategorieArticles)
    @JoinColumn()
    categorieArticle:CategorieArticle

    @OneToMany(()=>CategorieArticle, (categorieArticle)=>categorieArticle.categorieArticle)
    sousCategorieArticles:CategorieArticle[]
    
    @OneToMany(() => Contact, (contact) => contact.categorieArticle)
    contacts: Contact[]
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}