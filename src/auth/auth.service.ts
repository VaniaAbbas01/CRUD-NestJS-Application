import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { User } from 'src/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Logs in a user by validating credentials and issuing JWT tokens.
   *
   * @param dto - Data Transfer Object containing the user's name, email, and password
   * @param res - Express response object used to send success or error responses
   * @returns Sends status 200 with access and refresh tokens in cookies if login is successful,
   *          500 if required fields are missing or credentials are invalid,
   *          or throws an error if the user is not found
   */
  async loginUser(dto: CreateUserDto, res: Response) {
    const { name, email, password } = dto;

    // check for fields that are required
    if (!name?.trim() || !email?.trim() || !password.trim()) {
      return res.status(500).send({ message: 'Fill All Required Field!' });
    }

    const userOB = await this.userRepository.findOne({ where: { email } });

    if (!userOB) {
      throw new Error('User not found');
    }

    if (!userOB || !(await bcryptjs.compare(password, userOB.password))) {
      res.status(500).send({ message: 'Invalid Credentials' });
    }

    const accessToken = sign({ id: userOB.id }, 'access_secret', {
      expiresIn: 60 * 60,
    });

    const refreshToken = sign({ id: userOB.id }, 'refresh_secret', {
      expiresIn: 24 * 60 * 60,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).send({ message: 'Login Successful' });
  }

  /**
   * Registers a new user in the system.
   *
   * @param dto - Data Transfer Object containing the user's name, email, and password
   * @param res - Express response object used to send success or error responses
   * @returns Sends status 200 with the created user on success,
   *          500 with an error message if required fields are missing or
   *          if the email already exists
   */
  async registerUser(dto: CreateUserDto, res: Response) {
    const { name, email, password } = dto;

    // check for fields that are required
    if (!name?.trim() || !email?.trim() || !password.trim()) {
      return res.status(500).send({ message: 'Fill All Required Field!' });
    }

    try {
      const user = await this.userRepository.save({
        name,
        email,
        password: await bcryptjs.hash(password, 12),
      });
      return res.status(200).send(user);
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        //@ts-ignore
        if (error.code === '23505') {
          //@ts-ignore
          console.log(`Unique Constraint ${error.constraint} failed`);
          return res.status(500).send({
            message: 'User with same credentials already exists',
          });
        }
      }
      return res.status(500).send({ message: error });
    }
  }

  /**
   * Authenticates the user based on the access token in cookies.
   *
   * @param req - Express request object containing cookies
   * @param res - Express response object used to send the result
   * @returns Sends the authenticated user object with status 200 if valid,
   *          401 if unauthorized, or 500 if an internal error occurs
   */
  async authUser(req: Request, res: Response) {
    try {
      const accessToken = req.cookies['accessToken'];
      const payLoad: any = verify(accessToken, 'access_secret');
      if (!payLoad) {
        return res.status(401).send({ message: 'Unauthorised' });
      }
      const user = await this.userRepository.findOne({
        where: { id: payLoad.id },
      });
      if (!user) {
        return res.status(401).send({ message: 'Unauthorised' });
      }
      return res.status(200).send(user);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error });
    }
  }

  /**
   * Refreshes the user's access token using the refresh token stored in cookies.
   *
   * @param req - Express request object containing the refreshToken cookie
   * @param res - Express response object used to send the new access token or error
   * @returns Sends a new access token in cookies with status 200 if successful,
   *          401 if the refresh token is missing or invalid,
   *          or 500 if an internal server error occurs
   */
  async refreshUser(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      const payLoad: any = verify(refreshToken, 'refresh_secret');
      if (!payLoad) {
        return res.status(401).send({ message: 'Unauthorised' });
      }
      const accessToken = sign({ id: payLoad.id }, 'access_secret', {
        expiresIn: 60 * 60,
      });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).send({ message: 'Successfully Refreshed' });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error });
    }
  }

  /**
   * Logs out the user by clearing the access and refresh tokens from cookies.
   *
   * @param res - Express response object used to clear cookies and send the response
   * @returns Sends a status 200 response with a message indicating successful logout
   */
  async logoutUser(res: Response) {
    res.cookie('accessToken', '', { maxAge: 0 });
    res.cookie('refreshToken', '', { maxAge: 0 });
    return res.status(200).send({ message: 'Logout Successful' });
  }
}
