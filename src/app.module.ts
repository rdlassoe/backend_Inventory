import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Módulos de la aplicación
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonModule } from './person/person.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';
import { TypeMovementModule } from './type-movement/type-movement.module';
import { MovementInventoryModule } from './movement-inventory/movement-inventory.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { SaleModule } from './sale/sale.module';
//import { AuthModule } from './auth/auth.module';
import { TipoIdentificacionModule } from './tipo-identificacion/tipo-identificacion.module';
import { TypePersonModule } from './type-person/type-person.module';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [
    // 1. Carga las variables de entorno de forma global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Configura la conexión a la base de datos de forma asíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        
        // Carga automáticamente todas las entidades que encuentre en el proyecto
        autoLoadEntities: true,

        // Sincroniza el esquema de la BD con las entidades.
        // ¡ADVERTENCIA! Usar solo en desarrollo. En producción, puede borrar datos.
        synchronize: false, 
      }),
    }),
    
    // 3. Todos los módulos de tu aplicación
    PersonModule,
    UserModule,
    CategoryModule,
    ProductModule,
    InventoryModule,
    TypeMovementModule,
    MovementInventoryModule,
    PaymentMethodModule,
    SaleModule,
    TipoIdentificacionModule,
    TypePersonModule,
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
