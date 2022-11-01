import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HeaderNotification } from 'src/common/constants/HeaderNotification.constant';
import { ReturnResult } from 'src/common/dto/ReturnResult';

export function getTypeHeader(headers): ReturnResult<object> {
  const authorization = headers.authorization;
  const jwtService: JwtService = new JwtService();
  const configService: ConfigService = new ConfigService();

  const dataReturn: ReturnResult<object> = new ReturnResult<object>();

  if (!authorization) {
    dataReturn.message = HeaderNotification.NOT_FOUND_AUTHORIZATION;
  } else {
    try {
      const data = jwtService.verify(authorization.split(' ')[1], {
        secret: configService.get('JWT_SECRET'),
        ignoreExpiration: false,
      });

      dataReturn.message = HeaderNotification.TRUE_AUTHORIZATION;
      dataReturn.result = data.id;
    } catch (error) {
      // console.log(error.message);
      dataReturn.message = HeaderNotification.WRONG_AUTHORIZATION;
    }
  }

  return dataReturn;
}
