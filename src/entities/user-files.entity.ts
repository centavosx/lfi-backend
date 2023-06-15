import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  JoinTable,
} from 'typeorm';
import { Roles } from '../enum';
import { Scholar } from './scholar.entity';
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

  // @OneToOne(() => Scholar, (scholar) => scholar.gradeSlip)
  // @JoinTable({
  //   name: 'scholar',
  //   joinColumn: { name: 'grade_slip' },
  //   inverseJoinColumn: { name: 'id' },
  // })
  // scholar: Scholar | null;
}
