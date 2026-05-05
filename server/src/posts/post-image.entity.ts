import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Post } from './post.entity';

@Entity('post_image')
export class PostImage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  post_id!: number;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Post, (post) => post.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;
}
