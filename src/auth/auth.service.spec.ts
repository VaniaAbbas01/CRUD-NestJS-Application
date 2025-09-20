import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import express from 'express';
import * as bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<User>;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed'),
    compare: jest.fn().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registerUser should save user', async () => {
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    mockRepo.save.mockResolvedValue({ id: 1, ...dto, password: 'hashed' });

    await service.registerUser(dto, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      id: 1,
      ...dto,
      password: 'hashed',
    });
  });

  it('loginUser should send 500 if fields missing', async () => {
    const dto: CreateUserDto = { name: '', email: '', password: '' };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await service.loginUser(dto, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Fill All Required Field!',
    });
  });
});
