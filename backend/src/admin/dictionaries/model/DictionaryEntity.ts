/** Created by Pawel Malek **/
import { DictionaryColumn, DictionaryElement, DictionaryGroup, DictionaryI, DictionaryStatus, DictionaryStatuses } from '@shared/interfaces/DictionaryI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_dictionaries')
export class DictionaryEntity implements DictionaryI {
  
  @PrimaryGeneratedColumn({ name: 'dictionary_id' })
  dictionaryId: number;

  @Column({ name: 'code', unique: true })
  code: string;
  
  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ name: 'version', default: 1 })
  version: number;
  
  @Column({ 
    name: 'status',
    type: 'varchar',
    default: DictionaryStatuses.ACTIVE,
  })
  status: DictionaryStatus;

  @Column({ name: 'elements', type: 'jsonb' })
  elements: DictionaryElement[];
  
  @Column({ name: 'columns', type: 'jsonb' })
  columns: DictionaryColumn[];
  
  @Column({ name: 'groups', type: 'jsonb', nullable: true })
  groups: DictionaryGroup[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
