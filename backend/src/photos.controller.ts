import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  Headers as RequestHeaders,
} from '@nestjs/common';
import { prisma } from './db';
import { auth } from './auth';

@Controller('photos')
export class PhotosController {
  @Get()
  async getPhotos() {
    return prisma.photo.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async createPhoto(
    @Body()
    body: {
      url: string;
      description?: string;
      latitude: number;
      longitude: number;
    },
    @RequestHeaders() headers: Record<string, string>,
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

  @Get(':id')
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

  @Patch(':id')
  async updatePhoto(
    @Param('id') id: string,
    @Body() body: { description: string },
    @RequestHeaders() headers: Record<string, string>,
  ) {
    const session = await auth.api.getSession({
      headers: new Headers(headers),
    });
    if (!session) throw new UnauthorizedException();

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException();
    if (photo.userId !== session.user.id) throw new ForbiddenException();

    return prisma.photo.update({
      where: { id },
      data: { description: body.description },
    });
  }
}
