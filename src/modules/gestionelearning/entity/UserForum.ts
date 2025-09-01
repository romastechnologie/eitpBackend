import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Message } from "./Message";
import { Forum } from "./Forum";
import { User } from "../../gestiondesutilisateurs/entity/user.entity";


@Entity()
export class UserForum {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false })
    estActif: boolean

    @ManyToOne(() => Forum, (forum) => forum.userForums)
    forum: Forum

    @ManyToOne(() => User, (user) => user.userForums)
    user: User

    @OneToMany(() => Message, message => message.userForum)
    messages: Message[];

    @CreateDateColumn()
    createdAt: Timestamp

    @UpdateDateColumn()
    updatedAt: Timestamp;

    @DeleteDateColumn()
    deletedAt: Timestamp;
}