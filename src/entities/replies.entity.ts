import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactUs } from './contact_us.entity';

@Entity()
export class Replies {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  message: string;

  @ManyToOne(() => ContactUs, (contact) => contact.replies, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contactId', referencedColumnName: 'id' })
  contact: ContactUs;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  modified: Date;
}
