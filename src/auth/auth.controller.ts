import { Controller, Body, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   *
   * @param dto - DTO containing name, email, and password
   * @param res - Express response object used to send success or error responses
   * @returns Calls AuthService.registerUser to create the user
   */
  @Post('/register')
  registerUser(@Body() dto: CreateUserDto, @Res() res: express.Response) {
    return this.authService.registerUser(dto, res);
  }

  /**
   * Logs in a user by validating credentials and issuing JWT tokens.
   *
   * @param dto - DTO containing name, email, and password
   * @param res - Express response object used to send tokens or error responses
   * @returns Calls AuthService.loginUser to perform login and set cookies
   */
  @Post('/login')
  loginUser(@Body() dto: LoginDto, @Res() res: express.Response) {
    return this.authService.loginUser(dto, res);
  }

  /**
   * Returns the authenticated user's information based on the access token in cookies.
   *
   * @param req - Express request object containing cookies
   * @param res - Express response object used to send user info or error responses
   * @returns Calls AuthService.authUser to validate the token and return user data
   */
  @Get('/user')
  authUser(@Req() req: express.Request, @Res() res: express.Response) {
    return this.authService.authUser(req, res);
  }

  /**
   * Refreshes the access token using the refresh token in cookies.
   *
   * @param req - Express request object containing refreshToken cookie
   * @param res - Express response object used to send new access token or error
   * @returns Calls AuthService.refreshUser to issue a new access token
   */
  @Post('/refresh')
  refreshUser(@Req() req: express.Request, @Res() res: express.Response) {
    return this.authService.refreshUser(req, res);
  }

  /**
   * Logs out the user by clearing access and refresh tokens from cookies.
   *
   * @param res - Express response object used to clear cookies and send confirmation
   * @returns Calls AuthService.logoutUser to perform logout
   */
  @Get('/logout')
  logoutUser(@Res() res: express.Response) {
    return this.authService.logoutUser(res);
  }
}
