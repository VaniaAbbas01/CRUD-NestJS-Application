import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import express from 'express';
import { CreateUserDto } from './dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  // Mocking AuthService so that we don't call the real implementation
  const mockAuthService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    authUser: jest.fn(),
    refreshUser: jest.fn(),
    logoutUser: jest.fn(),
  };

  beforeEach(async () => {
    // Creating a testing module with the controller and mock service
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    // Getting an instance of the controller
    controller = module.get<AuthController>(AuthController);
  });

  // Basic test to ensure the controller is defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test for registerUser method
  it('registerUser should call AuthService.registerUser', async () => {
    // Sample data to simulate a user registration
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };
    // Mock Express response object with chained methods
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    // Call the controller method
    await controller.registerUser(dto, res);

    // Assert that the service method was called with the correct arguments
    expect(mockAuthService.registerUser).toHaveBeenCalledWith(dto, res);
  });

  // Test for loginUser method
  it('loginUser should call AuthService.loginUser', async () => {
    // Sample data to simulate a login
    const dto: CreateUserDto = {
      name: 'Test',
      email: 'a@b.com',
      password: '123',
    };

    // Mock Express response object
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;

    // Call the controller method
    await controller.loginUser(dto, res);

    // Assert that the service method was called with the correct arguments
    expect(mockAuthService.loginUser).toHaveBeenCalledWith(dto, res);
  });
});
