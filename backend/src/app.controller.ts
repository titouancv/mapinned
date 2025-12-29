import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AppService } from './app.service';
import { prisma } from './db';
import { auth } from './auth';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('photos')
  async getPhotos() {
    return prisma.photo.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('photos')
  async createPhoto(
    @Body()
    body: {
      url: string;
      description?: string;
      latitude: number;
      longitude: number;
    },
    @Headers() headers: Record<string, string>,
  ) {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session) throw new UnauthorizedException();

    return prisma.photo.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });
  }

  @Get('photos/:id')
  async getPhoto(@Param('id') id: string) {
    return prisma.photo.findUnique({
      where: { id },
      include: {
        user: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  @Post('comments')
  async createComment(
    @Body() body: { photoId: string; content: string },
    @Headers() headers: Record<string, string>,
  ) {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session) throw new UnauthorizedException();

    return prisma.comment.create({
      data: {
        content: body.content,
        photoId: body.photoId,
        userId: session.user.id,
      },
    });
  }

  @Get('auth/me')
  async getMe(@Headers() headers: Record<string, string>) {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session) throw new UnauthorizedException();
    return session.user;
  }
}
