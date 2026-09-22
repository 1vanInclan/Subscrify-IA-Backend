import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsString()
  @IsOptional()
  category?: string;
}