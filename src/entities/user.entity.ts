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
  password: string | null;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: false })
  level: Level;

  @Column({ nullable: false })
  program: string;

  @Column({ nullable: false, name: 'id_pic' })
  idPic: string;

  @Column({ nullable: false })
  ncae: string;

  @Column({ nullable: false })
  certificate: string;

  @Column({ nullable: false })
  pantawid: string;

  @Column({ nullable: false, name: 'grade_slip' })
  gradeSlip: string;

  @Column({ nullable: false, name: 'birth_cert' })
  birthCert: string;

  @Column({ nullable: false, name: 'home_sketch' })
  homeSketch: string;

  @Column({ nullable: true, name: 'water_bill' })
  waterBill?: string;

  @Column({ nullable: true, name: 'electric_bill' })
  electricBill?: string;

  @Column({ nullable: true, name: 'wifi_bill' })
  wifiBill?: string;

  @Column({ nullable: true, name: 'enrollment_bill' })
  enrollmentBill?: string;

  @Exclude()
  @Column({ nullable: true, default: null })
  code?: string;

  @ManyToMany(() => Role, (role) => role.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'role_id' },
  })
  roles: Role[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @DeleteDateColumn()
  deleted: Date | null;
}
