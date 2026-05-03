import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'forum',
      charset: 'utf8',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // 表已通过 SQL 建好，不自动同步
    }),
    AuthModule,
    UsersModule,
    BoardsModule,
    PostsModule,
  ],
})
export class AppModule {}
