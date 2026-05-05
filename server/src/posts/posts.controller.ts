import {
  BadRequestException,
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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { mkdirSync } from 'fs';
import { extname, join } from 'path';
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

const postImageDir = join(process.cwd(), 'uploads', 'posts');

function ensurePostImageDir() {
  mkdirSync(postImageDir, { recursive: true });
}

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  findFeed(
    @Query() query: PaginationDto,
    @Query('boardId') boardId?: string,
  ) {
    return this.postsService.findFeed(
      query.page!,
      query.pageSize!,
      boardId ? Number(boardId) : undefined,
    );
  }

  @Get('boards/:boardId/posts')
  findByBoard(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query() query: PaginationDto,
  ) {
    return this.postsService.findByBoard(boardId, query.page!, query.pageSize!);
  }

  @Get('posts/search')
  search(
    @Query() query: PaginationDto,
    @Query('q') q = '',
  ) {
    return this.postsService.searchPosts(q, query.page!, query.pageSize!);
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
  @HttpPost('posts/:id/images')
  @UseInterceptors(
    FilesInterceptor('files', 9, {
      storage: diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          ensurePostImageDir();
          cb(null, postImageDir);
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('仅支持图片文件'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  addImages(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AuthenticatedRequest,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请上传图片文件');
    }
    return this.postsService.addImages(id, req.user.id, req.user.role, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:postId/images/:imageId')
  removeImage(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsService.removeImage(postId, imageId, req.user.id, req.user.role);
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
