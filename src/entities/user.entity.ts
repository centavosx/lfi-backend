import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Role } from './role.entity';
import { Level, UserStatus } from '../enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  fname: string;

  @Column({ nullable: true })
  mname: string | null;

  @Column({ nullable: false })
  lname: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, default: UserStatus.PENDING })
  status: UserStatus;

  @Exclude()
  @Column({ nullable: true })
  password?: string | null;

  @Column({ nullable: true })
  address?: string | null;

  @Column({ nullable: true })
  level?: Level | null;

  @Column({ nullable: true })
  program?: string | null;

  @Column({ nullable: true, name: 'id_pic' })
  idPic?: string | null;

  @Column({ nullable: true })
  ncae?: string | null;

  @Column({ nullable: true })
  certificate?: string | null;

  @Column({ nullable: true })
  pantawid?: string | null;

  @Column({ nullable: true, name: 'grade_slip' })
  gradeSlip?: string | null;

  @Column({ nullable: true, name: 'birth_cert' })
  birthCert?: string | null;

  @Column({ nullable: true })
  autobiography?: string | null;

  @Column({ nullable: true, name: 'home_sketch' })
  homeSketch?: string | null;

  @Column({ nullable: true, name: 'water_bill' })
  waterBill?: string | null;

  @Column({ nullable: true, name: 'electric_bill' })
  electricBill?: string | null;

  @Column({ nullable: true, name: 'wifi_bill' })
  wifiBill?: string | null;

  @Column({ nullable: true, name: 'enrollment_bill' })
  enrollmentBill?: string | null;

  @Exclude()
  @Column({ nullable: true, default: null })
  code?: string | null;

  @ManyToMany(() => Role, (role) => role.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @Column({ nullable: true })
  accepted?: Date | null;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @DeleteDateColumn()
  deleted?: Date | null;
}
