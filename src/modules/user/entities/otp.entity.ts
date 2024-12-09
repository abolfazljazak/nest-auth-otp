import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity"

@Entity("otp")
export class OtpEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    code: string

    @Column()
    expries_in: Date

    @Column()
    userId: number

    @OneToOne(() => OtpEntity, (user) => user.otp, {onDelete: "CASCADE"})
    user: UserEntity
}