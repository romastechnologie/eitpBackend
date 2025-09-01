import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn,Unique } from "typeorm";
import { Media } from "./Media";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";
import { ArticleTag } from "./ArticleTag";
import { CategorieArticle } from "./CategorieArticle";

@Entity()
@Unique(['titre', 'categorieArticle','alias'])
export class Article{
    @PrimaryGeneratedColumn()
    id:number    

    @Column({nullable:false})
    @IsNotEmpty({message:"Le titre est obligatoire"})
    titre:string

    @Column({nullable:true})
    urlImage:string

    @Column({nullable:true})
    icone:string

    @Column({nullable:true})
    otherImage:string

    @Column({nullable:true})
    sousTitre:string

    @Column({nullable:true})
    alias:string

    @Column({nullable:true})
    metaTitle:string

    @Column({nullable:true})
    metaKeyword:string

    @Column('longtext',{nullable:true})
    metaDescription:string

    @Column('longtext', {nullable:false})
    contenu:string

    @OneToMany(() => ArticleTag, articletag => articletag.article)
    articletags: ArticleTag[];

    @Column({nullable:false})
    datePublication:string

    @Column({nullable:true})
    source:string
    
    @Column({default:"LA POSTE DU BENIN",nullable:false})
    auteur:string

    @Column({nullable:true})
    partageReseauSociaux:string

    @Column({default:false})
    estPublie:boolean

    @Column({default:true})
    statut:boolean

    @Column({default:false})
    alaUne:boolean

    @Column({nullable:true})
    numero:string
   
    @OneToMany(() => Media, (media) => media.article)
    medias: Media[]
    
    @ManyToOne(()=>Article, (article)=>article.articles)
    @JoinColumn()
    article:Article

    @OneToMany(()=>Article, (article)=>article.article)
    articles:Article[]

    @ManyToOne(() => CategorieArticle, (categorieArticle) => categorieArticle.articles)
    categorieArticle: CategorieArticle
    
    @ManyToOne(()=>User, (user)=>user.articles)
    @JoinColumn()
    user:User
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}