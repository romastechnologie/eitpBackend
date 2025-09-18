
import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { Etudiant } from "./Etudiant";
import { ParentEtudiant } from "./ParentEtudiant";
import { Quartier } from "../../gestiondeszones/entity/Quartier";

@Entity()
export class Parent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  nom: string;

  @Column()
  @IsNotEmpty({ message: "Le prénom est obligatoire" })
  prenom: string;

  @Column({ nullable: true })
  sexe: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ nullable: true })
  telephone1: string;

  @Column({ nullable: true })
  telephone2: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  lienParente: string; // Père, Mère, Tuteur

  // @ManyToMany(() => Etudiant, (etudiant) => etudiant.parents)
  // etudiants: Etudiant[];

  @OneToMany(() => ParentEtudiant, (parentetudiant) => parentetudiant.etudiant)
  parentetudiants: ParentEtudiant[]

  @ManyToOne(() => Quartier, quartier => quartier.parents)
  quartier: Quartier;

  @CreateDateColumn()
  createdAt: Timestamp

  @UpdateDateColumn()
  updatedAt: Timestamp;

  @DeleteDateColumn()
  deletedAt: Timestamp;
}
