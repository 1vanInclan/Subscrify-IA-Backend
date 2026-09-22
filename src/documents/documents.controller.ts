import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { GetUser } from '../common/decorators/get-user.decorator.js';
import { User } from '../users/entities/user.entity.js';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreateDocumentDto) {
    return this.documentsService.createDocument(user.id, dto);
  }

  @Get('search')
  search(@GetUser() user: User, @Query('q') query: string) {
    return this.documentsService.searchSimilar(user.id, query);
  }
}