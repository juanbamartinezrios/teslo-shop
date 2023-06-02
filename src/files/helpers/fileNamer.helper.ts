import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    // si se devuelve un false en el callback, el archivo no es aceptado por lo que la respuesta del endpoint es undefined
    if (!file) return callback(new Error('File is empty'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`;
    callback(null, fileName);
}