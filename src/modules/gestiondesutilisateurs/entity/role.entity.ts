import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp, ManyToOne } from "typeorm"
import { RolePermission } from "./RolePermission.entity"
import { User } from "./user.entity"
import { IsNotEmpty } from "class-validator"

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable:false, unique: true})
    @IsNotEmpty({ message: 'Le nom est une propriété requise.' })
    nom: string

    @Column({nullable:false, unique: true})
    @IsNotEmpty({ message: 'La description est une propriété requise.' })
    description: string

    // @Column({ type: 'simple-array', nullable: false })
    // privileges: string[];

    @OneToMany(() => RolePermission, rolePermission => rolePermission.role,{ cascade: true})
    public rolePermissions: RolePermission[];

    @OneToMany(() => User, (user) => user.role,)
    users: User

    @Column({default:false})
    estMarchand: boolean

    @Column({ nullable: true })
    marchandId: number;

   
    @CreateDateColumn()
    createdAt:Date;

    @UpdateDateColumn()
    updatedAt:Date;

    @DeleteDateColumn()
    deletedAt:Date;

}