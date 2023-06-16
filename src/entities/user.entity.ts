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
  AfterLoad,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Role } from './role.entity';
import { UserStatus } from '../enum';
import { UserFiles } from './user-files.entity';
import { Scholar } from './scholar.entity';

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

  @OneToMany(() => UserFiles, (files) => files.user, {
    eager: false,
  })
  @JoinTable({
    name: 'user_files',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'id' },
  })
  files: UserFiles[];

  @OneToMany(() => Scholar, (scholar) => scholar.user, {
    eager: false,
  })
  @JoinTable({
    name: 'scholar',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'id' },
  })
  scholar: Scholar[];

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @DeleteDateColumn()
  deleted?: Date | null;

  isExistingScholar: boolean;

  @AfterLoad()
  getScholar() {
    this.isExistingScholar = !!this.scholar && this.scholar.length > 0;
  }
}
