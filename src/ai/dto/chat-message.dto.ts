import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  message: string;
}