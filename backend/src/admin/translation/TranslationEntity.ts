/** Created by Pawel Malek **/
import { TranslationI } from '@shared/interfaces/TranslationI';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('jh_translations')
export class TranslationEntity implements TranslationI {

  @PrimaryGeneratedColumn({ name: 'translation_id' })
  translationId: number;

  @Column({ name: 'lang_code', unique: true })
  langCode: string;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'data', type: 'jsonb' })
  data: { [key: string]: any };
}
