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

  // LOGIN USER
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

  // REGISTER USER
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

  // AUTH USER
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

  // REFRESH USER
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

  async logoutUser(res: Response) {
    res.cookie('accessToken', '', { maxAge: 0 });
    res.cookie('refreshToken', '', { maxAge: 0 });
    return res.status(200).send({ message: 'Logout Successful' });
  }
}
