import { IsOptional, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsOptional()
  @IsString()
  idToken?: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  userInfo?: {
    googleId?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  };
}
