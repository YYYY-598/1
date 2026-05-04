import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Post } from '../posts/post.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async create(username: string, email: string, password: string): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: [{ email }, { username }],
    });
    if (existing) {
      throw new ConflictException('用户名或邮箱已存在');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      username,
      email,
      password: hashed,
      avatar_url: '',
      signature: '',
    });
    return this.userRepo.save(user);
  }

  async getMe(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const post_count = await this.postRepo.count({ where: { user_id: id } });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      signature: user.signature,
      created_at: user.created_at,
      post_count,
    };
  }

  async updateProfile(id: number, signature: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.signature = signature.trim();
    await this.userRepo.save(user);
    return this.getMe(id);
  }

  async updateAvatar(id: number, avatarUrl: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.avatar_url = avatarUrl;
    await this.userRepo.save(user);
    return {
      avatar_url: user.avatar_url,
    };
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      throw new ConflictException('当前密码错误');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);
    return { success: true as const };
  }

  async findAll(page: number, pageSize: number) {
    const [items, total] = await this.userRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_banned: user.is_banned,
        created_at: user.created_at,
      })),
      total,
      page,
      pageSize,
    };
  }

  async updateBanStatus(id: number, isBanned: boolean) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.is_banned = isBanned;
    const saved = await this.userRepo.save(user);

    return {
      id: saved.id,
      username: saved.username,
      email: saved.email,
      role: saved.role,
      is_banned: saved.is_banned,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  async getMyPosts(userId: number, page: number, pageSize: number) {
    const [items, total] = await this.postRepo.findAndCount({
      where: { user_id: userId },
      relations: ['board', 'comments'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((post) => ({
        id: post.id,
        title: post.title,
        summary: post.content.slice(0, 200),
        board_id: post.board_id,
        board_name: post.board.name,
        like_count: post.like_count,
        comment_count: post.comments.length,
        created_at: post.created_at,
        updated_at: post.updated_at,
      })),
      total,
      page,
      pageSize,
    };
  }
}
