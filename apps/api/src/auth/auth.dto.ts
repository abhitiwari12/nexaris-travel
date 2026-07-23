import { IsEmail, IsString, IsUUID, Matches, MinLength } from 'class-validator';

const passwordMessage = 'Password must include upper, lower, number, and symbol characters';
export class RegisterDto { @IsEmail() email!: string; @IsString() @MinLength(12) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, { message: passwordMessage }) password!: string; @IsString() firstName!: string; @IsString() lastName!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
export class RefreshDto { @IsString() refreshToken!: string; }
export class LogoutDto { @IsUUID() sessionId!: string; }
export class ForgotPasswordDto { @IsEmail() email!: string; }
export class ResetPasswordDto { @IsString() token!: string; @IsString() @MinLength(12) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, { message: passwordMessage }) password!: string; }
export class VerifyEmailDto { @IsString() token!: string; }
