import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Query,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

interface AuthenticatedRequest {
  user: {
    id: number;
    role: string;
  };
}

const avatarDir = join(process.cwd(), 'uploads', 'avatars');

function ensureAvatarDir() {
  mkdirSync(avatarDir, { recursive: true });
}

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.id);
  }

  @Put('profile')
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, dto.signature);
  }

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureAvatarDir();
          cb(null, avatarDir);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('仅支持图片文件'), false);
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: { filename: string },
  ) {
    if (!file) {
      throw new BadRequestException('请上传头像文件');
    }
    return this.usersService.updateAvatar(req.user.id, `/uploads/avatars/${file.filename}`);
  }

  @Put('password')
  changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, dto.old_password, dto.new_password);
  }

  @Get('posts')
  getMyPosts(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationDto,
  ) {
    return this.usersService.getMyPosts(req.user.id, query.page!, query.pageSize!);
  }
}
