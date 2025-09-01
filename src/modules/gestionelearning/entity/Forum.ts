import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserForum } from "./UserForum";


@Entity()
export class Forum {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le titre est obligatoire" })
    titre: string

    @Column('longtext', { nullable: false })
    @IsNotEmpty({ message: "La description est obligatoire" })
    description: string

    @Column('longtext', { nullable: false })
    @IsNotEmpty({ message: "La date de création est obligatoire" })
    dateCreation: string

    @Column({ default: true })
    statut: boolean

    @Column({ nullable: true })
    link: string

    @OneToMany(() => UserForum, (userForum) => userForum.forum)
    userForums: UserForum[]

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}