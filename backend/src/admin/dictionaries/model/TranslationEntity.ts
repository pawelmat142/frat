/** Created by Pawel Malek **/
import { TranslationI } from '@shared/interfaces/TranslationI';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity('jh_translations')
export class TranslationEntity implements TranslationI {

  @PrimaryGeneratedColumn({ name: 'translation_id' })
  translationId: number;

  @Expose()
  @Column({ name: 'lang_code', unique: true })
  langCode: string;
  
  @Expose()
  @Column({ name: 'version', default: 1 })
  version: number;
  
  @Expose()
  @Column({ name: 'data', type: 'jsonb' })
  data: { [key: string]: any };
}
