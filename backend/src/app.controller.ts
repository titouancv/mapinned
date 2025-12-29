import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Headers as RequestHeaders,
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

  @Post('comments')
  async createComment(
    @Body() body: { photoId: string; content: string },
    @RequestHeaders() headers: Record<string, string>,
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
  async getMe(@RequestHeaders() headers: Record<string, string>) {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session) throw new UnauthorizedException();
    return session.user;
  }
}
