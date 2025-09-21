import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import express from 'express';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  /**
   * Retrieves all books from the database.
   *
   * @param res - Express response object used to send the list of books
   * @returns Calls BooksService.findAll to fetch and return all books
   */
  @Get()
  getBooks(@Res() res: express.Response) {
    return this.bookService.findAll(res);
  }

  /**
   * Retrieves a single book by its ID.
   *
   * @param id - The UUID of the book to fetch
   * @param res - Express response object used to send the book or an error
   * @returns Calls BooksService.findOne to fetch and return the book
   */
  @Get(':id')
  getBook(@Param('id') id: string, @Res() res: express.Response) {
    return this.bookService.findOne(id, res);
  }

  /**
   * Creates a new book in the database.
   *
   * @param dto - DTO containing book details (title, author, etc.)
   * @param res - Express response object used to send the created book
   * @returns Calls BooksService.create to save the new book
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  createBook(@Body() dto: CreateBookDto, @Res() res: express.Response) {
    return this.bookService.create(dto, res);
  }

  /**
   * Updates an existing book by ID.
   *
   * @param id - The UUID of the book to update
   * @param dto - DTO containing updated book details
   * @param res - Express response object used to send the updated book or an error
   * @returns Calls BooksService.update to update the book in the database
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Res() res: express.Response,
  ) {
    return this.bookService.update(id, dto, res);
  }

  /**
   * Deletes a book by its ID.
   *
   * @param id - The UUID of the book to delete
   * @param res - Express response object used to send success or error message
   * @returns Calls BooksService.remove to delete the book from the database
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteBook(@Param('id') id: string, @Res() res: express.Response) {
    return this.bookService.remove(id, res);
  }
}
