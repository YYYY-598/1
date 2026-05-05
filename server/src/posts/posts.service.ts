import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostImage } from './post-image.entity';
import { Comment } from '../comments/comment.entity';
import { Board } from '../boards/board.entity';
import { User, UserRole } from '../users/user.entity';
import { Like } from '../likes/like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostImage)
    private readonly postImageRepo: Repository<PostImage>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Board)
    private readonly boardRepo: Repository<Board>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
  ) {}

  private toFeedItem(post: Post & { comment_count?: number }) {
    const images = (post.images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.url);

    return {
      id: post.id,
      title: post.title,
      summary: post.content.slice(0, 200),
      cover_url: images[0] || '',
      images,
      username: post.user.username,
      user_id: post.user_id,
      avatar_url: post.user.avatar_url,
      board_id: post.board_id,
      board_name: post.board.name,
      like_count: post.like_count,
      comment_count: post.comment_count || 0,
      created_at: post.created_at,
    };
  }

  private feedQuery() {
    return this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.board', 'board')
      .leftJoinAndSelect('post.images', 'images')
      .loadRelationCountAndMap('post.comment_count', 'post.comments');
  }

  async findByBoard(boardId: number, page: number, pageSize: number) {
    const [items, total] = await this.feedQuery()
      .where('post.board_id = :boardId', { boardId })
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('images.sort_order', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map((post) => this.toFeedItem(post)),
      total,
      page,
      pageSize,
    };
  }

  async findFeed(page: number, pageSize: number, boardId?: number) {
    const query = this.feedQuery()
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('images.sort_order', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (boardId) {
      query.where('post.board_id = :boardId', { boardId });
    }

    const [items, total] = await query.getManyAndCount();

    return {
      items: items.map((post) => this.toFeedItem(post)),
      total,
      page,
      pageSize,
    };
  }

  async searchPosts(q: string, page: number, pageSize: number) {
    const keyword = q.trim();
    if (!keyword) {
      return { items: [], total: 0, page, pageSize };
    }

    const [items, total] = await this.feedQuery()
      .where('post.title LIKE :keyword OR post.content LIKE :keyword', {
        keyword: `%${keyword}%`,
      })
      .orderBy('post.created_at', 'DESC')
      .addOrderBy('images.sort_order', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      items: items.map((post) => this.toFeedItem(post)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['user', 'board', 'images', 'comments', 'comments.user'],
      order: {
        comments: {
          created_at: 'ASC',
        },
      },
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      username: post.user.username,
      avatar_url: post.user.avatar_url,
      user_id: post.user_id,
      board_id: post.board_id,
      board_name: post.board.name,
      cover_url: post.images?.[0]?.url || '',
      images: (post.images || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => image.url),
      like_count: post.like_count,
      liked: false,
      created_at: post.created_at,
      updated_at: post.updated_at,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        username: comment.user.username,
        avatar_url: comment.user.avatar_url,
        user_id: comment.user_id,
        created_at: comment.created_at,
      })),
    };
  }

  async create(boardId: number, userId: number, dto: CreatePostDto) {
    const [board, user] = await Promise.all([
      this.boardRepo.findOne({ where: { id: boardId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);

    if (!board) {
      throw new NotFoundException('板块不存在');
    }
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const post = this.postRepo.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
      board_id: boardId,
      user_id: userId,
    });
    const saved = await this.postRepo.save(post);

    return {
      id: saved.id,
      title: saved.title,
      content: saved.content,
      user_id: saved.user_id,
      board_id: saved.board_id,
      like_count: saved.like_count,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  async update(id: number, currentUserId: number, currentUserRole: string, dto: UpdatePostDto) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const canEdit = post.user_id === currentUserId || currentUserRole === UserRole.ADMIN;
    if (!canEdit) {
      throw new ForbiddenException('无权限编辑该帖子');
    }

    post.title = dto.title.trim();
    post.content = dto.content.trim();
    const saved = await this.postRepo.save(post);

    return {
      id: saved.id,
      title: saved.title,
      content: saved.content,
      board_id: saved.board_id,
      user_id: saved.user_id,
      updated_at: saved.updated_at,
    };
  }

  async remove(id: number, currentUserId: number, currentUserRole: string) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const canDelete = post.user_id === currentUserId || currentUserRole === UserRole.ADMIN;
    if (!canDelete) {
      throw new ForbiddenException('无权限删除该帖子');
    }

    await this.postRepo.remove(post);
    return { success: true };
  }

  async addImages(postId: number, currentUserId: number, currentUserRole: string, files: Array<{ filename: string }>) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const canEdit = post.user_id === currentUserId || currentUserRole === UserRole.ADMIN;
    if (!canEdit) {
      throw new ForbiddenException('无权限上传该帖子的图片');
    }

    const maxOrder = await this.postImageRepo
      .createQueryBuilder('image')
      .select('MAX(image.sort_order)', 'max')
      .where('image.post_id = :postId', { postId })
      .getRawOne<{ max: string | null }>();

    const startOrder = Number(maxOrder?.max || 0);
    const images = files.map((file, index) => this.postImageRepo.create({
      post_id: postId,
      url: `/uploads/posts/${file.filename}`,
      sort_order: startOrder + (index + 1) * 10,
    }));

    const saved = await this.postImageRepo.save(images);
    return {
      images: saved.map((image) => ({
        id: image.id,
        url: image.url,
        sort_order: image.sort_order,
      })),
    };
  }

  async removeImage(postId: number, imageId: number, currentUserId: number, currentUserRole: string) {
    const image = await this.postImageRepo.findOne({
      where: { id: imageId, post_id: postId },
      relations: ['post'],
    });
    if (!image) {
      throw new NotFoundException('图片不存在');
    }

    const canDelete = image.post.user_id === currentUserId || currentUserRole === UserRole.ADMIN;
    if (!canDelete) {
      throw new ForbiddenException('无权限删除该图片');
    }

    await this.postImageRepo.remove(image);
    return { success: true };
  }

  async removeAsAdmin(id: number) {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    await this.postRepo.remove(post);
    return { success: true };
  }

  async createComment(postId: number, userId: number, dto: CreateCommentDto) {
    const [post, user] = await Promise.all([
      this.postRepo.findOne({ where: { id: postId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const comment = this.commentRepo.create({
      content: dto.content.trim(),
      post_id: postId,
      user_id: userId,
    });
    const saved = await this.commentRepo.save(comment);

    return {
      id: saved.id,
      content: saved.content,
      username: user.username,
      avatar_url: user.avatar_url,
      user_id: saved.user_id,
      created_at: saved.created_at,
    };
  }

  async removeComment(id: number, currentUserId: number, currentUserRole: string) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    const canDelete = comment.user_id === currentUserId || currentUserRole === UserRole.ADMIN;
    if (!canDelete) {
      throw new ForbiddenException('无权限删除该评论');
    }

    await this.commentRepo.remove(comment);
    return { success: true };
  }

  async removeCommentAsAdmin(id: number) {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    await this.commentRepo.remove(comment);
    return { success: true };
  }

  async toggleLike(postId: number, userId: number) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const existing = await this.likeRepo.findOne({
      where: { post_id: postId, user_id: userId },
    });

    let liked: boolean;

    if (existing) {
      await this.likeRepo.remove(existing);
      post.like_count = Math.max(0, post.like_count - 1);
      liked = false;
    } else {
      const like = this.likeRepo.create({
        post_id: postId,
        user_id: userId,
      });
      await this.likeRepo.save(like);
      post.like_count += 1;
      liked = true;
    }

    await this.postRepo.save(post);

    return {
      liked,
      like_count: post.like_count,
    };
  }
}
