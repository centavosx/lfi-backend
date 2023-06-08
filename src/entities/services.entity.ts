import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './events.entity';
import { User } from './user.entity';

@Entity()
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @ApiProperty({ type: User, isArray: true, nullable: true })
  @ManyToMany(() => User, (user) => user.services, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  public users: User[];

  @ApiProperty({ type: Appointment, isArray: true, nullable: true })
  @ManyToMany(() => Appointment, (appointment) => appointment.service)
  public appointment: Appointment[];
}
