import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('boards/:boardId/posts')
  findByBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: PaginationDto,
  ) {
    return this.postsService.findByBoard(boardId, query.page!, query.pageSize!);
  }
}
