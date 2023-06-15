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

  @Column()
  name: string;

  @Column()
  lastGwa: number;

  @Column({ name: 'grade_slip' })
  gradeSlip: string;

  @Column({ name: 'enrollment_slip', nullable: true })
  enrollmentSlip: string;

  @Column({ name: 'status' })
  status: 'started' | 'ended';

  @ManyToOne(() => User, (user) => user.scholar)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created: Date;

  @Column({ nullable: true })
  ended: Date | null;
}
