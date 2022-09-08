import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { RegisterDTO } from '../dtos/register.dto';
import { UsersService } from 'src/modules/users/services/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
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
}
