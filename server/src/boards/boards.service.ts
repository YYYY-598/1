import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { SaveBoardDto } from './dto/save-board.dto';

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

  async create(dto: SaveBoardDto): Promise<Board> {
    const name = dto.name.trim();
    const description = dto.description.trim();

    const existing = await this.boardRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('板块名称已存在');
    }

    const board = this.boardRepo.create({ name, description });
    return this.boardRepo.save(board);
  }

  async update(id: number, dto: SaveBoardDto): Promise<Board> {
    const board = await this.boardRepo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException('板块不存在');
    }

    const name = dto.name.trim();
    const description = dto.description.trim();

    const existing = await this.boardRepo.findOne({ where: { name } });
    if (existing && existing.id !== id) {
      throw new ConflictException('板块名称已存在');
    }

    board.name = name;
    board.description = description;
    return this.boardRepo.save(board);
  }

  async remove(id: number) {
    const board = await this.boardRepo.findOne({ where: { id } });
    if (!board) {
      throw new NotFoundException('板块不存在');
    }

    await this.boardRepo.remove(board);
    return { success: true };
  }
}
