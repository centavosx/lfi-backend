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
  lastGwa: number;

  @Column({ name: 'grade_slip', unique: true })
  gradeSlip: string;

  @Column({ name: 'enrollment_bill', nullable: true, unique: true })
  enrollmentBill: string;

  @Column({ name: 'status' })
  status: 'pending' | 'started' | 'ended' | 'rejected' | 'verify';

  @ManyToOne(() => User, (user) => user.scholar)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  education: Education;

  @Column()
  level: Level;

  @Column()
  semester: number;

  @Column()
  program?: string | null;

  @Column({ nullable: true })
  accepted?: Date | null;

  @CreateDateColumn()
  created: Date;

  @Column({ nullable: true })
  ended: Date | null;
}
