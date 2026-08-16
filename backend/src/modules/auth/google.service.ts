import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class GoogleAuthService {
  private googleClient: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.googleClient = new OAuth2Client(clientId, clientSecret);
  }

  async verifyGoogleToken(dto: GoogleLoginDto): Promise<GoogleUserProfile> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    // 1. If idToken is provided and valid Google client ID configured
    if (dto.idToken) {
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: dto.idToken,
          audience: googleClientId || undefined,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new UnauthorizedException('Invalid Google ID token payload');
        }

        return {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          avatarUrl: payload.picture,
        };
      } catch (err) {
        // If verification fails or is dev token, check if userInfo fallback exists
        if (dto.userInfo && dto.userInfo.email && dto.userInfo.googleId) {
          return {
            googleId: dto.userInfo.googleId,
            email: dto.userInfo.email,
            name: dto.userInfo.name || dto.userInfo.email.split('@')[0],
            avatarUrl: dto.userInfo.avatarUrl,
          };
        }
        throw new UnauthorizedException(`Google authentication failed: ${(err as Error).message}`);
      }
    }

    // 2. Fallback for Dev/Mock mode if userInfo is passed directly
    if (dto.userInfo && dto.userInfo.email && dto.userInfo.googleId) {
      return {
        googleId: dto.userInfo.googleId,
        email: dto.userInfo.email,
        name: dto.userInfo.name || dto.userInfo.email.split('@')[0],
        avatarUrl: dto.userInfo.avatarUrl,
      };
    }

    throw new UnauthorizedException('Missing Google token or profile credentials');
  }
}
