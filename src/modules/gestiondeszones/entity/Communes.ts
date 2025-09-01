import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";


@Entity()
export class Commune{
    @PrimaryGeneratedColumn()
    id:number

    @Column({unique:true, nullable:true})
    @IsNotEmpty({ message:"Le code est obligatoire" })
    code:string

    @Column({unique:true, nullable:true})
    @IsNotEmpty({ message:"Le libellé est obligatoire" })
    libelle:string

    @ManyToMany(() => User, (user) => user.communes)
    users: User[];

   
    @ManyToOne(()=>User)
    userCreation:User
    
    @CreateDateColumn()
    createdAt:Timestamp
    
    @UpdateDateColumn()
    updatedAt:Timestamp;

    @DeleteDateColumn()
    deletedAt:Timestamp;
}