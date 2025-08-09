import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { SpecialitiesModule } from './specialities/specialities.module';
import { FavouritesModule } from './favourites/favourites.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
        const isDev = nodeEnv === 'development';

        // If a single DATABASE_URL is provided, prefer it (perfect for Neon)
        const url = config.get<string>('DATABASE_URL');

        // Enable SSL automatically for Neon or if DB_SSL=true
        const sslRequested =
          (url && url.includes('neon.tech')) ||
          config.get<string>('DB_SSL') === 'true';

        // Common options
        const base = {
          type: 'postgres' as const,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isDev,              // false in production
          logging: isDev,
          // Neon requires SSL; using rejectUnauthorized:false is fine here
          ...(sslRequested ? { ssl: { rejectUnauthorized: false } } : {}),
        };

        // URL mode (Neon / any hosted PG)
        if (url) {
          return {
            ...base,
            url, // e.g. postgresql://USER:PASS@HOST.neon.tech/DB?sslmode=require
          };
        }

        // Separate var mode (local/dev)
        return {
          ...base,
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<string>('DB_PORT') ?? 5432),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
        };
      },
    }),
    RestaurantsModule,
    UsersModule,
    SpecialitiesModule,
    FavouritesModule,
    CommentsModule,
    AuthModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
