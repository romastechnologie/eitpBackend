import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp } from "typeorm"
import { RolePermission } from "./RolePermission.entity"

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false, unique: true})
    nom: string;

    @Column({nullable:false, unique: true})
    description: string;

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
    
    @OneToMany(() => RolePermission, rolePermission => rolePermission.permission,{ cascade: true })
    public rolePermissions: RolePermission[];

}