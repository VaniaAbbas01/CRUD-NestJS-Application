import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBookDto } from './dto/create-book.dto';
import express from 'express';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Get()
  async getBooks(@Res() res: express.Response) {
    const books = await this.bookService.findAll();
    const result = books.map((u) => {
      return u;
    });
    return res.status(200).json(result);
  }

  @Get(':id')
  async getBook(@Param('id') id: string, @Res() res: express.Response) {
    const book = await this.bookService.findOne(id);
    if (!book) {
      return res.status(404).json({ message: 'Book Not Found' });
    }
    return res.status(200).json(book);
  }

  @Put(':id')
  async updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Res() res: express.Response,
  ) {
    try {
      const updatedBook = await this.bookService.update(id, dto);
      return res.status(200).json(updatedBook);
    } catch (error) {
      return res.status(500).json({ message: error });
    }
  }

  @Delete(':id')
  async deleteBook(@Param('id') id: string, @Res() res: express.Response) {
    try {
      await this.bookService.remove(id);
      return res.status(200).json({ message: 'Book Deleted Successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
