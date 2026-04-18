import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
        PORT: Joi.number().default(3001),
        FRONTEND_URL: Joi.string().uri().required(),
        CORS_ALLOWED_ORIGINS: Joi.string().empty('').optional(),

        // Database
        DATABASE_URL: Joi.string().required(),

        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional().allow(''),

        // JWT
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_TTL: Joi.string().default('7d'),
        JWT_REFRESH_TTL: Joi.string().default('30d'),

        // amoCRM
        AMO_DOMAIN: Joi.string().required(),
        AMO_CLIENT_ID: Joi.string().required(),
        AMO_CLIENT_SECRET: Joi.string().required(),
        AMO_ACCOUNT_ID: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        AMO_API_DOMAIN: Joi.string().required(),
        AMO_REDIRECT_URI: Joi.string().uri().required(),
        AMO_ACCESS_TOKEN: Joi.string().empty('').optional(),
        AMO_REFRESH_TOKEN: Joi.string().empty('').optional(),

        // Backward-compatible aliases
        AMOCRM_BASE_URL: Joi.string().uri().optional(),
        AMOCRM_CLIENT_ID: Joi.string().optional(),
        AMOCRM_CLIENT_SECRET: Joi.string().optional(),
        AMOCRM_REDIRECT_URI: Joi.string().uri().optional(),

        // Email (optional until email sending is enabled)
        EMAIL_PROVIDER: Joi.string().valid('sendgrid', 'postmark').empty('').default('sendgrid'),
        EMAIL_API_KEY: Joi.string().empty('').optional(),
        EMAIL_FROM: Joi.string().email().empty('').optional(),

        // Webhook
        WEBHOOK_SECRET: Joi.string().min(16).empty('').optional(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
})
export class ConfigModule {}
