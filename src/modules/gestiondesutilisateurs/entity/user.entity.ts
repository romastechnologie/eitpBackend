import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Role } from "./role.entity";
import bcryptjs = require("bcryptjs");

import { IsEmail, IsNotEmpty } from "class-validator";
import { Article } from "../../gestiondesarticles/entity/Article";

import { Commune } from "../../gestiondeszones/entity/Communes";
import { UserForum } from "../../gestionelearning/entity/UserForum";
import { Reponse } from "../../gestionelearning/entity/Reponse";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ nullable: true })
  // nomComplet: string;

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true, unique: true })
  telephone: string;


  @Column({ nullable: true })
  sexe: string;

  @Column({ nullable: false, unique: true })
  @IsEmail({}, { message: "L'adresse email est invalide." })
  email: string;

  @Column({ nullable: true })
  numeroNational: string;

  @Column({ default: false })
  mailIsVerifiy: boolean;

  @Column({ nullable: true })
  tokenVerifyMail: string;

  @Column({ nullable: true })
  createdTokenVerifyMail: Date;

  @Column()
  @IsNotEmpty({ message: "Le mot de passe est obligatoire." })
  password: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @BeforeInsert()
  async addRef() {
    this.password = await bcryptjs.hash(this.password, 12);
  }

  @OneToMany(() => Article, (article) => article.user)
  articles: Article[];

  @Column({ default: false })
  estMarchand: boolean;

  @Column({ default: false })
  estLivreur: boolean;

  @Column({ nullable: true })
  codeMarchand: string;

  @ManyToMany(() => Commune, (commune) => commune.users)
  @JoinTable({ name: "zone_couverture" })
  communes: Commune[];

  @ManyToOne(() => User, (user) => user.users)
  user: User;

  @OneToMany(() => User, (user) => user.user)
  users: User[];

  @OneToMany(() => UserForum, (userForum) => userForum.user)
  userForums: UserForum[]

  @Column({ default: true })
  statut: boolean;

  @OneToMany(() => Reponse, reponse => reponse.user)
      reponses: Reponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
