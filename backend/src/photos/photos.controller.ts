import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  async getPhotos() {
    return this.photosService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPhoto(@Body() createPhotoDto: CreatePhotoDto, @Req() req: any) {
    return this.photosService.create(req.user.id, createPhotoDto);
  }

  @Get(':id')
  async getPhoto(@Param('id') id: string) {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePhoto(
    @Param('id') id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
    @Req() req: any,
  ) {
    return this.photosService.update(req.user.id, id, updatePhotoDto);
  }
}
