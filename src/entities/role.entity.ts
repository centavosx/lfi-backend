import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Roles } from '../enum';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: Roles, unique: true })
  name: Roles;

  @ApiProperty({ type: User, isArray: true })
  @ManyToMany(() => User, (user) => user.roles)
  public users: User[];
}
