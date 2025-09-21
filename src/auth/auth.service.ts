import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';

@Injectable()
/**
 * Service responsible for handling authentication and user-related operations.
 * Provides functionality for registration, login, authentication, token refresh,
 * and logout using JWT access/refresh tokens stored in HTTP-only cookies.
 */
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Logs in a user by validating credentials and issuing JWT tokens.
   *
   * @param dto - DTO containing the user's email and password.
   * @param res - Express response object used to send tokens in cookies.
   * @returns Response with HTTP status:
   *          - 200 and sets access/refresh tokens on success,
   *          - 400 if fields are missing,
   *          - 401 if credentials are invalid.
   */
  async loginUser(dto: LoginDto, res: Response) {
    const { email, password } = dto;

    if (!email?.trim() || !password.trim()) {
      return res.status(400).send({ message: 'Fill All Required Field!' });
    }

    const userOB = await this.userRepository.findOne({ where: { email } });

    if (!userOB || !(await bcryptjs.compare(password, userOB.password))) {
      return res.status(401).send({ message: 'Invalid Credentials' });
    }

    const accessToken = sign(
      { id: userOB.id },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: '1h',
      },
    );

    const refreshToken = sign(
      { id: userOB.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' },
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).send({ message: 'Login Successful' });
  }

  /**
   * Registers a new user by saving hashed credentials to the database.
   *
   * @param dto - DTO containing the user's name, email, and password.
   * @param res - Express response object used to return the result.
   * @returns Response with HTTP status:
   *          - 201 and the created user object on success,
   *          - 400 if fields are missing,
   *          - 409 if email already exists,
   *          - 500 on internal errors.
   */
  async registerUser(dto: CreateUserDto, res: Response) {
    const { name, email, password } = dto;

    if (!name?.trim() || !email?.trim() || !password.trim()) {
      return res.status(400).send({ message: 'Fill All Required Field!' });
    }

    try {
      const user = await this.userRepository.save({
        name,
        email,
        password: await bcryptjs.hash(password, 12),
      });

      return res.status(201).send(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // @ts-ignore
        if (error.code === '23505') {
          return res.status(409).send({
            message: 'User with same credentials already exists',
          });
        }
      }
      return res.status(500).send({ message: 'Internal Server Error' });
    }
  }

  /**
   * Authenticates the user based on the access token in cookies.
   *
   * @param req - Express request object containing cookies.
   * @param res - Express response object used to send the result.
   * @returns Response with HTTP status:
   *          - 200 and the user object if valid,
   *          - 401 if unauthorized,
   *          - 500 if token is invalid or expired.
   */
  async authUser(req: Request, res: Response) {
    try {
      const accessToken = req.cookies['accessToken'];
      if (!accessToken) {
        return res.status(401).send({ message: 'Unauthorised' });
      }

      const payLoad: any = verify(accessToken, process.env.JWT_ACCESS_SECRET!);

      const user = await this.userRepository.findOne({
        where: { id: payLoad.id },
      });

      if (!user) {
        return res.status(401).send({ message: 'Unauthorised' });
      }

      return res.status(200).send(user);
    } catch (error) {
      return res.status(500).send({ message: 'Invalid or Expired Token' });
    }
  }

  /**
   * Refreshes the user's access token using the refresh token stored in cookies.
   *
   * @param req - Express request object containing the refreshToken cookie.
   * @param res - Express response object used to send the new access token.
   * @returns Response with HTTP status:
   *          - 200 and sets a new access token on success,
   *          - 401 if refresh token is missing or invalid.
   */
  async refreshUser(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        return res.status(401).send({ message: 'Unauthorised' });
      }

      const payLoad: any = verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      );

      const accessToken = sign(
        { id: payLoad.id },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '1h' },
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).send({ message: 'Successfully Refreshed' });
    } catch (error) {
      return res.status(401).send({ message: 'Invalid Refresh Token' });
    }
  }

  /**
   * Logs out the user by clearing authentication cookies.
   *
   * @param res - Express response object used to clear cookies and send response.
   * @returns Response with HTTP status 200 and a success message.
   */
  async logoutUser(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).send({ message: 'Logout Successful' });
  }
}
