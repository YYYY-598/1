import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    const user = this.userRepo.create({ username, email, password: hashed });
    return this.userRepo.save(user);
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
}
