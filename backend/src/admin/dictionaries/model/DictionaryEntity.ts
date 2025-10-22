/** Created by Pawel Malek **/
import { DictionaryColumn, DictionaryElement, DictionaryGroup, DictionaryI, DictionaryStatus, DictionaryStatuses } from '@shared/interfaces/DictionaryI';
import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_dictionaries')
export class DictionaryEntity implements DictionaryI {
  
  @PrimaryGeneratedColumn({ name: 'dictionary_id' })
  dictionaryId: number;

  @Expose()
  @Column({ name: 'code', unique: true })
  code: string;
  
  @Expose()
  @Column({ name: 'description', nullable: true })
  description: string;
  
  @Expose()
  @Column({ name: 'version', default: 1 })
  version: number;
  
  @Expose()
  @Column({ 
    name: 'status',
    type: 'varchar',
    default: DictionaryStatuses.ACTIVE,
  })
  status: DictionaryStatus;
  
  @Expose()
  @Column({ name: 'elements', type: 'jsonb' })
  elements: DictionaryElement[];
  
  @Expose()
  @Column({ name: 'columns', type: 'jsonb' })
  columns: DictionaryColumn[];
  
  @Expose()
  @Column({ name: 'groups', type: 'jsonb', nullable: true })
  groups: DictionaryGroup[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
