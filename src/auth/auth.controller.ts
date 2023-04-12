import { Body, Controller, Post, Res, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration-center')
  async regCenterLogin(
    @Body() data: { centerId: string; password: string },
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(
          await this.authService.regCenterLogin(data.centerId, data.password),
        );
    } catch (error) {
      res.status(404).json(error);
    }
  }
}
