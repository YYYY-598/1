import { Controller, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.removeAsAdmin(id);
  }
}
