import {Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import type { Subscription } from '../../subscriptions/entities/subscription.entity.js';
import type { Document } from '../../documents/entities/document.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @OneToMany('Subscription', (sub: Subscription) => sub.user)
  subscriptions: Subscription[];

  @OneToMany('Document', (doc: any) => doc.user)
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}