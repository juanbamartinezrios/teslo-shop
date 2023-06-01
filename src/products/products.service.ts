import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { query } from 'express';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    // DataSource sabe cual es la conexion, usuario de db, configuracion, etc
    private readonly dataSource: DataSource
  ) {
  }

  async create(createProductDto: CreateProductDto) {
    try {
      // operador REST
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        // operador SPREAD
        ...productDetails,
        // TypeORM sabe que al crear un producto, si dentro utilizo productImageRepository para crear una image, al crear
        // el elemento, va a relacionar con el productId a la imagen nueva
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });
      // el save va a guardar el producto e imagenes (en ambas tablas)
      await this.productRepository.save(product);
      return { ...product, images: images };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    // se hace para no devolver el id sino sólo el array de url's
    return products.map(product => ({
      ...product,
      images: product.images.map(img => img.url)
    }));
  }

  async findOne(searchTerm: string) {
    let product: Product;
    if (isUUID(searchTerm)) {
      product = await this.productRepository.findOneBy({ id: searchTerm });
    } else {
      // el queryBuilder tiene la posibilidad de darle un ALIAS a la tabla
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: searchTerm.toUpperCase(), slug: searchTerm.toLowerCase()
        })
        // se utiliza para obtener las aeger relations cuando se utiliza el queryBuilder
        // pide la relacion+alias de la segunda tabla
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    if (!product) throw new NotFoundException(`Product with id or slug ${searchTerm} not found.`);
    return product
  }

  // para devolver el objeto como quiero
  async findOnePlain(searchTerm: string) {
    const { images = [], ...product } = await this.findOne(searchTerm);
    return {
      ...product,
      images: images.map(img => img.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    // busca un product por id y carga todas las propiedades del objecto updateProductDto
    // esto no actualiza sino que lo prepara para el update
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    });

    if (!product) throw new NotFoundException(`Product with id: ${id} not found.`);

    // create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    // queryRunner ==> procedimientos (si algo sale bien, dispara transacciones (serie de querys que impactan la DB)/commit 
    // sino hace un rollback)
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        // borrar todos los productImages cuya columna (productId) sea igual a id
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        // esto aún no impacta a la DB
        product.images = images.map(img => this.productImageRepository.create({ url: img }));
      }
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);
      // commit de la transaccion y se libera si todo sale bien
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      // rollback de la transaccion si algo sale mal y se libera
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs.');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('prod');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleExceptions(error);
    }
  }
}
