import { Controller, Body, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  registerUser(@Body() dto: CreateUserDto, @Res() res: express.Response) {
    return this.authService.registerUser(dto, res);
  }

  @Post('/login')
  loginUser(@Body() dto: CreateUserDto, @Res() res: express.Response) {
    return this.authService.loginUser(dto, res);
  }

  @Get('/user')
  authUser(@Req() req: express.Request, @Res() res: express.Response) {
    return this.authService.authUser(req, res);
  }

  @Post('/refresh')
  refreshUser(@Req() req: express.Request, @Res() res: express.Response) {
    return this.authService.refreshUser(req, res);
  }

  @Get('/logout')
  logoutUser(@Res() res: express.Response) {
    return this.authService.logoutUser(res);
  }
}
