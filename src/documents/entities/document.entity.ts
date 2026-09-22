import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import type { User } from '../../users/entities/user.entity.js';


@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // Guardamos el embedding de Gemini (dimensión 768 para text-embedding-004)
  @Column({
    type: 'vector',
    dimension: 768,
    nullable: true,
  } as any)
  embedding: number[];

  @Column({ nullable: true })
  category: string;

  @ManyToOne('User', (user: any) => user.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}