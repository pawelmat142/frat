/** Created by Pawel Malek **/
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { SettingsI, Theme, Themes } from '@shared/interfaces/SettingsI';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_user_settings')
export class SettingsEntity implements SettingsI {

    @PrimaryColumn({ name: 'uid' })
    uid: string;

    @Column({ name: 'theme', type: 'varchar', length: 10, default: Themes.LIGHT })
    theme: Theme;

    @Column({ name: 'language_code', type: 'varchar', length: 10, default: 'en' })
    languageCode: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToOne(() => UserEntity)
    @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
    user: UserEntity;
}
