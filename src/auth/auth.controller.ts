import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration-dep')
  async regDepLogin(
    @Body() data: { name: string; password: string },
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.authService.regDepLogin(data.name, data.password));
    } catch (error) {
      res.status(404).json(error);
    }
  }

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
