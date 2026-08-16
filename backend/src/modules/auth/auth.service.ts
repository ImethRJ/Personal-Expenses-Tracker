import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { GoogleAuthService, GoogleUserProfile } from './google.service';
import { GoogleLoginDto } from './dto/google-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private googleAuthService: GoogleAuthService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        passwordHash,
        provider: 'LOCAL',
        currency: registerDto.currency || 'LKR',
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        savingsGoal: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account was created using Google Sign-In. Please sign in with Google.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const profile = await this.googleAuthService.verifyGoogleToken(googleLoginDto);

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { googleId: profile.googleId },
          { email: profile.email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
          provider: 'GOOGLE',
          currency: 'LKR',
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          ...(profile.avatarUrl && { avatarUrl: profile.avatarUrl }),
          provider: user.provider || 'GOOGLE',
        },
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: token,
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateProfileDto.name && { name: updateProfileDto.name }),
        ...(updateProfileDto.currency && { currency: updateProfileDto.currency }),
        ...(updateProfileDto.savingsGoal !== undefined && { savingsGoal: updateProfileDto.savingsGoal }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        savingsGoal: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
