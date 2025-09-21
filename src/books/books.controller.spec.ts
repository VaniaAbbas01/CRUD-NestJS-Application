import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Book } from '../book.entity';
import express from 'express';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  // Simple fake guard for testing (always allows)
  class MockJwtAuthGuard {
    canActivate = jest.fn(() => true);
  }

  // Mock repository to avoid interacting with a real database
  const mockBookRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  // Mock Express response object
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as express.Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockBookRepository },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
    jest.clearAllMocks();
  });

  // Test to ensure controller is defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test fetching all books
  it('getBooks should return all books', async () => {
    const books = [{ id: '1', title: 'Book 1' }];
    mockBookRepository.find.mockResolvedValue(books);

    await controller.getBooks(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(books);
  });

  // Test fetching a single book by ID
  it('getBook should return a book', async () => {
    const book = { id: '1', title: 'Book 1' };
    mockBookRepository.findOne.mockResolvedValue(book);

    await controller.getBook('1', res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(book);
  });

  // Test creating a new book
  it('createBook should create a book', async () => {
    const dto = { title: 'New Book', author: 'Author', pages: 100 };
    const savedBook = { id: '1', ...dto };

    mockBookRepository.create.mockReturnValue(dto);
    mockBookRepository.save.mockResolvedValue(savedBook);

    await controller.createBook(dto, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(savedBook);
  });

  // Test updating a book
  it('updateBook should update a book', async () => {
    const dto = { title: 'Updated Book' };
    const book = { id: '1', title: 'Old Book' };
    const updatedBook = { ...book, ...dto };

    mockBookRepository.findOne.mockResolvedValue(book);
    mockBookRepository.save.mockResolvedValue(updatedBook);

    await controller.updateBook('1', dto, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedBook);
  });

  // Test deleting a book successfully
  it('deleteBook should delete a book', async () => {
    mockBookRepository.delete.mockResolvedValue({ affected: 1 });

    await controller.deleteBook('1', res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Deleted' });
  });

  // Test deleting a non-existent book
  it('deleteBook should return 404 if book not found', async () => {
    mockBookRepository.delete.mockResolvedValue({ affected: 0 });

    await controller.deleteBook('999', res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Not Found' });
  });
});
