import { IsString, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreatePhotoDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
