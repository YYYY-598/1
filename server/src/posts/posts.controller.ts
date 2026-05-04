import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post as HttpPost,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { PostsService } from './posts.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

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

  @Get('posts/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost('boards/:boardId/posts')
  create(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body() dto: CreatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.create(boardId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.update(id, req.user.id, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.remove(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost('posts/:postId/comments')
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.createComment(postId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  removeComment(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.removeComment(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost('posts/:id/like')
  toggleLike(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.toggleLike(id, req.user.id);
  }
}
