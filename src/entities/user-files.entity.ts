import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

export enum FileTypes {
  ID_PIC = 'ID_PICTURE',
  NCAE = 'NCAE',
  CERT = 'CERTIFICATE',
  PANTAWID = 'PANTAWID',
  GRADE_SLIP = 'GRADE_SLIP',
  BIRTH_CERT = 'BIRTH_CERTIFICATE',
  BIO = 'AUTOBIOGRAPHY',
  HOME_SKETCH = 'HOME_SKETCH',
  WATER_BILL = 'WATER_BILL',
  ELECTRIC_BILL = 'ELECTRIC_BILL',
  WIFI_BILL = 'WIFI_BILL',
  ENROLLMENT_BILL = 'ENROLLMENT_BILL',
  HOME_VISIT_PROOF = 'HOME_VISIT_PROOF',
}

@Entity()
export class UserFiles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: FileTypes })
  type: FileTypes;

  @Column()
  link: string;

  @ManyToOne(() => User, (user) => user.files)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  date: Date;
}
