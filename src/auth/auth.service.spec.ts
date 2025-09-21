import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import express from 'express';
import * as bcryptjs from 'bcryptjs';
import { sign } from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let repo: Repository<User>;

  // Mock repository to avoid hitting a real database
  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  // Mock bcryptjs methods to avoid actual hashing
  jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed'),
    compare: jest.fn().mockResolvedValue(true),
  }));

  beforeEach(async () => {
    // Create a testing module and provide the AuthService and mocked repository
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    // Get instances from the module
    service = module.get<AuthService>(AuthService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Basic test to ensure the service is defined
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for registerUser method
  it('registerUser should save user', async () => {
    // Sample data to register
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };
    // Mock Express response object
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    // Mock repository save method to return a saved user object
    mockRepo.save.mockResolvedValue({ id: 1, ...dto, password: 'hashed' });

    // Call registerUser
    await service.registerUser(dto, res);

    // Assert response status and payload
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      id: 1,
      ...dto,
      password: 'hashed',
    });
  });

  // Test for loginUser method when required fields are missing
  it('loginUser should send 500 if fields missing', async () => {
    // Create DTO with empty fields
    const dto: LoginDto = { email: '', password: '' };

    // Mock Express response
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    // Call loginUser
    await service.loginUser(dto, res);

    // Expect 500 response with proper error message
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Fill All Required Field!',
    });
  });
});
