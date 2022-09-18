import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { RegisterDTO } from '../dtos/register.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(registrationData: RegisterDTO) {
    try {
      registrationData.email = registrationData.email.toLowerCase();
      const userExist = await this.userService.getUserByEmail(
        registrationData.email,
      );

      if (userExist) {
        throw new UnauthorizedException(
          `Email: ${registrationData.email} exists. Try with another email`,
        );
      }

      const hashedPassword = await bcrypt.hash(registrationData.password, 10);
      const user = await this.userService.createUser({
        ...registrationData,
        password: hashedPassword,
      });

      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  public async getAuthenticatedUser(email: string, password: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user)
        throw new UnauthorizedException(`Email ${email} does not exist`);

      await this.verifyPassword(password, user.password);

      return user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async removeRefreshToken(id: string) {
    await this.userService.removeRefreshToken(id);
  }

  public async getCookieWithJwtToken(userId: string) {
    const userData = await this.getUserData(userId);
    const payload = userData;
    const token = this.jwtService.sign(payload, {
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}s`,
    });
    return token;
  }

  public async getCookieWithJwtRefreshToken(userId: string) {
    const payload = { id: userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}s`,
    });

    await this.userService.setCurrentRefreshToken(token, userId);

    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_REFRESH_EXPIRATION_TIME',
    )}s`;
    return {
      cookie,
      token,
    };
  }

  public getCookiesForLogOut() {
    return 'Refresh=; Value =; HttpOnly; Path=/; Max-Age=0';
  }

  async activateAccount(token: string) {
    return this.userService.activateAccount(token);
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Wrong password. Try again!');
    }
  }

  private async getUserData(id: string) {
    const user = await this.userService.getUserData(id);
    return user;
  }
}
