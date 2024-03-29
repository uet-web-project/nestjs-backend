import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registration-dep')
  async regDepLogin(
    @Body() data: { depId: string; password: string },
    @Res() res,
  ): Promise<void> {
    try {
      res
        .status(200)
        .json(await this.authService.regDepLogin(data.depId, data.password));
    } catch (error) {
      res.status(error.status).json(error);
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
      res.status(error.status).json(error);
    }
  }

  @Get(':token')
  async checkToken(@Param('token') token, @Res() res): Promise<void> {
    try {
      res.status(200).json(await this.authService.checkToken(token));
    } catch (error) {
      res.status(error.status || 404).json(error);
    }
  }
}
