export interface IAuthService {
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  generateToken(userId: string, email: string): Promise<string>;
  verifyToken(token: string): Promise<{ userId: string; email: string }>;
}
