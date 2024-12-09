import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OtpEntity } from "./otp.entity";

@Entity("user")
export class UserEntity {
    @PrimaryGeneratedColumn("increment")
    id: number

    @Column()
    first_name: string

    @Column()
    last_name: string

    @Column()
    mobile: string

    @Column()
    mobile_verify: boolean

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date

    @Column()
    otpId: number

    @OneToOne(() => OtpEntity, (otp) => otp.user, {onDelete: "CASCADE"})
    @JoinColumn({name: "otpId"})
    otp: OtpEntity
}
