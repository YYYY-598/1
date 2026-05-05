import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MeController } from './me.controller';
import { AuthModule } from '../auth/auth.module';
import { Post } from '../posts/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post]), forwardRef(() => AuthModule)],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
