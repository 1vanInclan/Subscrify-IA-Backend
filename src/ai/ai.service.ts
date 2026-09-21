import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { AiToolsService } from './ai-tools.service.js';

@Injectable()
export class AiService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiToolsService: AiToolsService,
  ) {}

  onModuleInit() {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY no encontrada en las variables de entorno.',
      );
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Definición de las herramientas (Tools) para Gemini
   */
  private getToolDeclarations(): FunctionDeclaration[] {
    return [
      {
        name: 'getUserSubscriptions',
        description:
          'Obtiene la lista de suscripciones activas del usuario actual.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'getMonthlyExpenses',
        description:
          'Calcula el total proyectado de gastos mensuales en dólares (USD).',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'createSubscription',
        description:
          'Registra una nueva suscripción en la base de datos del usuario.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'Nombre del servicio (ej. Netflix, Spotify, AWS).',
            },
            price: {
              type: Type.NUMBER,
              description: 'Precio o costo de la suscripción.',
            },
            category: {
              type: Type.STRING,
              description:
                'Categoría de la suscripción (ej. Entertainment, Infrastructure).',
            },
            billingPeriod: {
              type: Type.STRING,
              enum: ['MONTHLY', 'YEARLY'],
              description: 'Periodo de cobro.',
            },
            nextBillingDate: {
              type: Type.STRING,
              description:
                'Siguiente fecha de cobro en formato YYYY-MM-DD.',
            },
          },
          required: ['name', 'price'],
        },
      },
      {
        name: 'cancelSubscription',
        description:
          'Cancela o marca como no activa una suscripción del usuario por su nombre.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'Nombre o parte del nombre de la suscripción a cancelar.',
            },
          },
          required: ['name'],
        },
      },
    ];
  }

  /**
   * Procesa la solicitud del usuario con Gemini y ejecuta Tools dinámicamente
   */
  async processMessage(userId: string, userMessage: string) {
    const tools = this.getToolDeclarations();

    // 1. Enviar el mensaje a Gemini con el catálogo de herramientas
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction:
          'Eres el asistente virtual inteligente de Subscrify. Ayudas al usuario a gestionar sus suscripciones y finanzas personales usando las herramientas disponibles. Sé conciso, amable y claro.',
        tools: [{ functionDeclarations: tools }],
      },
    });

    const functionCalls = response.functionCalls;

    // Si Gemini decide no llamar a ninguna herramienta, respondemos con el texto directo
    if (!functionCalls || functionCalls.length === 0) {
      return {
        text: response.text,
        executedTools: [],
      };
    }

    // 2. Si Gemini solicita ejecutar una función, la resolvemos localmente
    const toolResults = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      let result: any;

      if (name === 'getUserSubscriptions') {
        result = await this.aiToolsService.getUserSubscriptions(userId);
      } else if (name === 'getMonthlyExpenses') {
        result = await this.aiToolsService.getMonthlyExpenses(userId);
      } else if (name === 'createSubscription') {
        result = await this.aiToolsService.createSubscription(userId, args as any);
      } else if (name === 'cancelSubscription') {
        result = await this.aiToolsService.cancelSubscription(userId, args as any);
      }

      toolResults.push({ name, result });
    }

    // 3. Le devolvemos a Gemini el resultado de la herramienta para que genere la respuesta final al usuario
    const modelParts = response.candidates?.[0]?.content?.parts || [];

    const secondResponse = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
        {
          role: 'model',
          parts: modelParts,
        },
        {
          role: 'user',
          parts: toolResults.map((t) => ({
            functionResponse: {
              name: t.name,
              response: { output: t.result },
            },
          })),
        },
      ],
      config: {
        systemInstruction:
          'Eres el asistente virtual inteligente de Subscrify. Presenta los datos obtenidos de manera amigable y clara.',
      },
    });

    return {
      text: secondResponse.text,
      executedTools: toolResults,
    };
  }
}