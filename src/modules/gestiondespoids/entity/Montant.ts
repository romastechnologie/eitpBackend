import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, Unique } from "typeorm"
import { Distance } from "./Distance"
import { IntervallePoids } from "./IntervallePoids"

@Entity()
export class Montant {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:true})
    categorieProduit:string

    @Column({nullable:true})
    montant:number

    @ManyToOne(() => Distance, (distance) => distance.montants)
    distance: Distance
    
    @ManyToOne(() => IntervallePoids, (intervallePoids) => intervallePoids.montants)
    intervallePoids: IntervallePoids

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}


