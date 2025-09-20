import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../book.entity';
import express from 'express';

describe('BooksService', () => {
  let service: BooksService;
  let mockRepo: any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as express.Response;

  beforeEach(async () => {
    mockRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all books', async () => {
    const books = [{ id: '1', title: 'Book 1' }];
    mockRepo.find.mockResolvedValue(books);

    await service.findAll(res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(books);
  });

  it('findOne should return a book', async () => {
    const book = { id: '1', title: 'Book 1' };
    mockRepo.findOne.mockResolvedValue(book);

    await service.findOne('1', res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(book);
  });

  it('findOne should return 404 if book not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await service.findOne('999', res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Not Found' });
  });

  it('create should save and return a book', async () => {
    const dto = { title: 'New Book', author: 'Author', pages: 100 };
    const savedBook = { id: '1', ...dto };

    mockRepo.create.mockReturnValue(dto);
    mockRepo.save.mockResolvedValue(savedBook);

    await service.create(dto, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(savedBook);
  });

  it('update should update a book', async () => {
    const book = { id: '1', title: 'Old Book' };
    const dto = { title: 'Updated Book' };
    const updatedBook = { ...book, ...dto };

    mockRepo.findOne.mockResolvedValue(book);
    mockRepo.save.mockResolvedValue(updatedBook);

    await service.update('1', dto, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedBook);
  });

  it('update should return 404 if book not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await service.update('999', { title: 'No Book' }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Not Found' });
  });

  it('remove should delete a book', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });

    await service.remove('1', res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Deleted' });
  });

  it('remove should return 404 if book not found', async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });

    await service.remove('999', res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Book Not Found' });
  });
});
