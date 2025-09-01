import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, Timestamp, Unique } from "typeorm"
import { Permission } from "./permission.entity"
import { Role } from "./role.entity"

@Entity()
export class RolePermission {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    roleId: number

    @Column()
    permissionId: number

    @ManyToOne(() => Role, (role) => role.rolePermissions)
    role: Role
    
    @ManyToOne(() => Permission, (permission) => permission.rolePermissions,)
    permission: Permission

    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;
}


