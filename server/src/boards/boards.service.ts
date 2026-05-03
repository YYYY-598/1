import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
  ) {}

  findAll(): Promise<Board[]> {
    return this.boardRepo.find({ order: { created_at: 'DESC' } });
  }

  async findById(id: number): Promise<Board> {
    const board = await this.boardRepo.findOne({ where: { id } });
    if (!board) throw new NotFoundException('板块不存在');
    return board;
  }
}
