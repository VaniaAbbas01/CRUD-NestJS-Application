import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import express from 'express';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  /**
   * Retrieves all books
   *
   * @param res - Express response object
   * @returns All books or 404 if not found
   */
  async findAll(res: express.Response) {
    const books = await this.bookRepository.find();
    return res.status(200).json(books);
  }

  /**
   * Retrieves a book by ID
   *
   * @param id - UUID of the book
   * @param res - Express response object
   * @returns A book or 404 if not found
   */
  async findOne(id: string, res: express.Response) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    return res.status(200).json(book);
  }

  /**
   * Creates a book
   *
   * @param dto - Partial data to create a book
   * @param res - Express response object
   * @returns 201 - success
   */
  async create(dto: CreateBookDto, res: express.Response) {
    const book = this.bookRepository.create(dto);
    const savedBook = await this.bookRepository.save(book);
    return res.status(201).json(savedBook);
  }

  /**
   * Updates a book by ID
   *
   * @param id - UUID of the book
   * @param dto - Partial data to update
   * @param res - Express response object
   * @returns Updated book or 404 if not found
   */
  async update(id: string, dto: UpdateBookDto, res: express.Response) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    // Update the book fields
    const updatedBook = { ...book, ...dto };
    await this.bookRepository.save(updatedBook);

    return res.status(200).json(updatedBook);
  }

  /**
   * Updates a book by ID
   *
   * @param id - UUID of the book
   * @param res - Express response object
   * @returns Deletion Message or 404 if not found
   */
  async remove(id: string, res: express.Response) {
    const book = await this.bookRepository.delete(id);
    if (book.affected === 0) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    return res.status(200).json({ message: 'Book Deleted' });
  }
}
