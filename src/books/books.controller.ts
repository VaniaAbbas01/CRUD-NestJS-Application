import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import express from 'express';

@Controller('books')
export class BooksController {
  constructor(private readonly bookService: BooksService) {}

  @Get()
  getBooks(@Res() res: express.Response) {
    return this.bookService.findAll(res);
  }

  @Get(':id')
  getBook(@Param('id') id: string, @Res() res: express.Response) {
    return this.bookService.findOne(id, res);
  }

  @Post()
  createBook(@Body() dto: CreateBookDto, @Res() res: express.Response) {
    return this.bookService.create(dto, res);
  }

  @Put(':id')
  updateBook(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Res() res: express.Response,
  ) {
    return this.bookService.update(id, dto, res);
  }

  @Delete(':id')
  deleteBook(@Param('id') id: string, @Res() res: express.Response) {
    return this.bookService.remove(id, res);
  }
}
