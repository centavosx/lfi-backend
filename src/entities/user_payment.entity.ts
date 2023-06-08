import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Appointment, User } from '.';
import { UserTransaction } from './user_transaction.entity';

@Entity()
export class UserPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  paypalId: string;

  @Column({ nullable: true })
  refId: string | null;

  @Column({ nullable: false })
  status: 'PAID' | 'PENDING' | 'CANCELED';

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  appointmentId: string;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => UserTransaction, (transaction) => transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: UserTransaction | null;

  @OneToOne(() => Appointment, (appointment) => appointment)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment | null;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;

  @DeleteDateColumn()
  deleted: Date;
}
