import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import ms from 'ms';
import type { Response, Request } from 'express';
import { isDev } from 'src/utils/is-dev';

@Injectable()
export class AuthService {
  private readonly JWT_EXPIRES_IN: StringValue;
  private readonly JWT_REFRES_EXPIRES_IN: StringValue;
  private readonly COOKIE_DOMAIN: string;

  private readonly MOCK_ID = 'supersecretid';
  private readonly MOCK_PWD = 'admin';
  private readonly MOCK_EMAIL = 'admin@example.com';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_EXPIRES_IN =
      this.configService.getOrThrow<StringValue>('JWT_EXPIRES_IN');
    this.JWT_REFRES_EXPIRES_IN = this.configService.getOrThrow<StringValue>(
      'JWT_REFRES_EXPIRES_IN',
    );

    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  login(res: Response, data: LoginDto) {
    if (data.email !== this.MOCK_EMAIL || data.password !== this.MOCK_PWD) {
      throw new NotFoundException('Password or Email is incorrect');
    }

    return this.auth(res, this.MOCK_ID);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Token is invalid');
    }

    const payload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const isRigth = payload.id === this.MOCK_ID;
      if (!isRigth) {
        throw new UnauthorizedException('Token is invalid');
      }
      return this.auth(res, this.MOCK_ID);
    }
  }

  async logout(res: Response) {
    this.setCookie(res, 'resfreshToken', new Date(0));
    return true;
  }

  private generateTokens(id: string) {
    const accessToken = this.jwtService.sign(
      { id },
      {
        expiresIn: this.JWT_EXPIRES_IN,
      },
    );
    const refreshToken = this.jwtService.sign(
      { id },
      {
        expiresIn: this.JWT_REFRES_EXPIRES_IN,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private auth(res: Response, id: string) {
    const { refreshToken, accessToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + ms(this.JWT_REFRES_EXPIRES_IN)),
    );

    return accessToken;
  }

  validate(payload: string) {
    if (payload !== this.MOCK_ID) {
      throw new NotFoundException('not found');
    }

    return { email: this.MOCK_EMAIL, id: this.MOCK_ID };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}
