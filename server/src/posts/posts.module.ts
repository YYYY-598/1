import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostImage } from './post-image.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { AdminPostsController } from './admin-posts.controller';
import { AdminCommentsController } from './admin-comments.controller';
import { Comment } from '../comments/comment.entity';
import { Board } from '../boards/board.entity';
import { User } from '../users/user.entity';
import { Like } from '../likes/like.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage, Comment, Board, User, Like]), AuthModule],
  controllers: [PostsController, AdminPostsController, AdminCommentsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
