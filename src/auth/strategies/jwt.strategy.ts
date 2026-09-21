import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config'
import { User } from "../../users/entities/user.entity.js";
import { InjectRepository } from "@nestjs/typeorm";

export interface JwtPayload{
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret'
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {id: payload.sub}
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found')
    }

    return user;
  }


}