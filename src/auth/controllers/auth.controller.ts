import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { RegisterDTO } from '../dtos/register.dto';
import JwtAuthenticationGuard from '../guards/jwt-authentication.guard';
import { LocalAuthGuard } from '../guards/localAuth.guard';
import JwtRefreshGuard from '../guards/refresh-authentication.guard';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registrationData: RegisterDTO) {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    if (user.token !== null) {
      throw new BadRequestException(
        `Please confirm email before login to the system`,
      );
    }

    const accessTokenCookie = await this.authService.getCookieWithJwtToken(
      user.id,
    );
    const refreshTokenCookie =
      await this.authService.getCookieWithJwtRefreshToken(user.id);

    request.res.setHeader('Set-Cookie', refreshTokenCookie.cookie);

    return {
      accessToken: accessTokenCookie,
      refreshToken: refreshTokenCookie.token,
    };
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.authService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtToken(
      request.user.id,
    );

    return accessTokenCookie;
  }

  @Post('/activate/:token')
  async activateAccount(@Param() { token }) {
    return await this.authService.activateAccount(token);
  }
}
