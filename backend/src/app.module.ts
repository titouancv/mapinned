import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { PhotosController } from './photos.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AuthController, PhotosController],
  providers: [AppService],
})
export class AppModule {}
