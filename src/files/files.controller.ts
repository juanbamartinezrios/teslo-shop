import { Controller, Post, Get, Res, UploadedFile, UseInterceptors, BadRequestException, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers/index';
import { diskStorage } from 'multer';
import { Response } from "express";
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:imageName')
  findProductImage(
    // en el momento en que se utlice este decorador, se rompe la funcionalidad de Nest en el método que lo utiliza
    // con Res se emite manualmente la respuesta, no queda bajo el manejo de Nest
    // con Res se saltan varias cosas globales también
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  // se utiliza el file interceptor y se le indica el nombre de la propiedad que viaja en el body
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }
    // host_api+files/product:imageName (la segunda parte es dejar servido el fileName para el endpoint @Get('product/:imageName'))
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return { secureUrl };
  }
}
