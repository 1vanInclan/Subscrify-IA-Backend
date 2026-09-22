import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { Document } from './entities/document.entity.js';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada.');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Genera el embedding usando el modelo de Gemini text-embedding-004
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });

    return response.embeddings?.[0]?.values || [];
  }

  /**
   * Registra un nuevo documento y genera su vector en BD
   */
  async createDocument(
    userId: string,
    data: { title: string; content: string; category?: string },
  ) {
    const embedding = await this.generateEmbedding(data.content);

    const doc = this.documentRepository.create({
      title: data.title,
      content: data.content,
      category: data.category || 'General',
      userId,
      embedding,
    });

    return this.documentRepository.save(doc);
  }

  /**
   * Realiza la búsqueda por similitud del coseno usando el operador <=> de pgvector
   */
  async searchSimilar(userId: string, queryText: string, limit = 3) {
    const queryVector = await this.generateEmbedding(queryText);
    const vectorString = `[${queryVector.join(',')}]`;

    // SQL nativo para consultar distancia coseno con pgvector
    const results = await this.dataSource.query(
      `
      SELECT id, title, content, category,
             (embedding <=> $1) AS distance
      FROM documents
      WHERE "userId" = $2
      ORDER BY distance ASC
      LIMIT $3;
      `,
      [vectorString, userId, limit],
    );

    return results;
  }
}