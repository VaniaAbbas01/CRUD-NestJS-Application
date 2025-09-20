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

  async findAll(res: express.Response) {
    const books = await this.bookRepository.find();
    return res.status(200).json(books);
  }

  async findOne(id: string, res: express.Response) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    return res.status(200).json(book);
  }

  async create(dto: CreateBookDto, res: express.Response) {
    const book = this.bookRepository.create(dto);
    const savedBook = await this.bookRepository.save(book);
    return res.status(201).json(savedBook);
  }

  async update(id: string, dto: UpdateBookDto, res: express.Response) {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
  }
  async remove(id: string, res: express.Response) {
    const book = await this.bookRepository.delete(id);
    if (book.affected === 0) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    return res.status(200).json({ message: 'Book Deleted' });
  }
}
