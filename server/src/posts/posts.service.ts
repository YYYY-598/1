import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async findByBoard(boardId: number, page: number, pageSize: number) {
    const [items, total] = await this.postRepo.findAndCount({
      where: { board_id: boardId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((post) => ({
        id: post.id,
        title: post.title,
        summary: post.content.slice(0, 200),
        username: post.user.username,
        like_count: post.like_count,
        comment_count: 0, // TODO: 后续实现评论计数
        created_at: post.created_at,
      })),
      total,
      page,
      pageSize,
    };
  }
}
