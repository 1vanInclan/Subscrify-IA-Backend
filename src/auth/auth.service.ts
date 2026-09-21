import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async register(registerDto: RegisterDto) {
    const {email, password, fullName} = registerDto;

    const existingUser = await this.userRepository.findOne({ where: {email}});
    if (existingUser) {
      throw new ConflictException('The email is already registered.')
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName,
    });

    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        fullName: true
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
