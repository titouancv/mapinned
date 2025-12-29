import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.photo.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
      include: {
        user: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!photo) throw new NotFoundException(`Photo with ID ${id} not found`);
    return photo;
  }

  async create(userId: string, createPhotoDto: CreatePhotoDto) {
    return this.prisma.photo.create({
      data: {
        ...createPhotoDto,
        userId,
      },
    });
  }

  async update(userId: string, id: string, updatePhotoDto: UpdatePhotoDto) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException(`Photo with ID ${id} not found`);
    if (photo.userId !== userId)
      throw new ForbiddenException('You can only update your own photos');

    return this.prisma.photo.update({
      where: { id },
      data: { description: updatePhotoDto.description },
    });
  }
}
