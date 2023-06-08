import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { Replies } from './replies.entity';

@Entity()
export class ContactUs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  from: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  subject: string;

  @OneToMany(() => Replies, (reply) => reply.contact, {
    eager: true,
  })
  @JoinTable({
    name: 'replies',
    joinColumn: { name: 'contactId' },
    inverseJoinColumn: { name: 'id' },
  })
  replies: Replies[];

  @CreateDateColumn()
  created: Date;
}
