import { CertificateI } from "@shared/interfaces/CertificateI";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { Expose } from 'class-transformer';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_certificates')
export class CertificateEntity implements CertificateI {

    @PrimaryGeneratedColumn({ name: 'certificate_id' })
    @Expose()
    certificateId: number;

    @Column({ name: 'uid' })
    @Expose()
    uid: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
    user: UserEntity;

    @Column({ name: 'code' })
    @Expose()
    code: string;

    @Column({ name: 'validity_date', type: 'date' })
    @Expose()
    validityDate: string; // Local date string in YYYY-MM-DD format
}