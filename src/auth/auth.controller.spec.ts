import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import express from 'express';
import { CreateUserDto } from './dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    authUser: jest.fn(),
    refreshUser: jest.fn(),
    logoutUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registerUser should call AuthService.registerUser', async () => {
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await controller.registerUser(dto, res);

    expect(mockAuthService.registerUser).toHaveBeenCalledWith(dto, res);
  });

  it('loginUser should call AuthService.loginUser', async () => {
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    await controller.loginUser(dto, res);

    expect(mockAuthService.loginUser).toHaveBeenCalledWith(dto, res);
  });
});
