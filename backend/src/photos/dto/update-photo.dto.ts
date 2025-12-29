import { IsString, IsOptional } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  @IsOptional()
  description?: string;
}
