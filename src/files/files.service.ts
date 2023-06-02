import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {
    getStaticProductImage(imageName: string) {
        // join __dirname (path de root), ir a la carpeta que preciso desde mi posición absoluta, nombre del archivo
        const path = join(__dirname, '../../static/products', imageName);
        // si no existe el path
        if (!existsSync(path)) {
            throw new BadRequestException(`No product found with image ${imageName}`);
        }
        return path;
    }
}
