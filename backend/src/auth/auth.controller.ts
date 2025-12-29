import { Controller, All, Req, Res } from '@nestjs/common';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res);
  }
}
