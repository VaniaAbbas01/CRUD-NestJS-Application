import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['accessToken'];

    if (!token) return false;

    try {
      const payLoad = this.jwtService.verify(token);
      request['user'] = payLoad;
      return true;
    } catch {
      return false;
    }
  }
}
