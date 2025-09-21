import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard that protects routes by validating the JWT access token stored in cookies.
 *
 * Usage: Apply this guard to controller routes using @UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * Determines whether a request is authorized by verifying the JWT access token.
   *
   * @param context - Execution context containing the incoming request
   * @returns true if the token is valid and the user is authenticated, false otherwise
   * @sideEffect - Attaches the decoded JWT payload to request['user'] if valid
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['accessToken'];

    if (!token) return false;

    try {
      const payLoad = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request['user'] = payLoad;
      return true;
    } catch {
      return false;
    }
  }
}
