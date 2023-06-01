import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities/index';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    // Con esto se le indican las entitades que se definen en el modulo
    TypeOrmModule.forFeature([
      Product,
      ProductImage
    ])
  ],
  exports: [ProductsService]
})
export class ProductsModule { }
