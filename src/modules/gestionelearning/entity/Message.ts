
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { UserForum } from "./UserForum";


@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: false })
    @IsNotEmpty({ message: "Le contenu est obligatoire" })
    contenu: string

    @Column('longtext', { nullable: false })
    @IsNotEmpty({ message: "La date est obligatoire" })
    dateEnvoi: Date

    @ManyToOne(() => UserForum, (userForum) => userForum.messages)
    userForum: UserForum

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}

