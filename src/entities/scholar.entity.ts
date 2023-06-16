import { Education, Level } from '../enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Scholar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'last_gwa' })
  lastGwa: number = null;

  @Column({ name: 'grade_slip', unique: true })
  gradeSlip: string = null;

  @Column({ name: 'enrollment_bill', nullable: true, unique: true })
  enrollmentBill: string = null;

  @Column({ name: 'status' })
  status: 'pending' | 'started' | 'ended' | 'rejected' | 'verify' = 'verify';

  @ManyToOne(() => User, (user) => user.scholar)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  education: Education = null;

  @Column()
  level: Level = null;

  @Column()
  program?: string | null = null;

  @Column({ nullable: true })
  accepted?: Date | null = null;

  @CreateDateColumn()
  created: Date;

  @Column({ nullable: true })
  ended: Date | null = null;
}
