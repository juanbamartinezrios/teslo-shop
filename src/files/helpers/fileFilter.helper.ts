export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    // si se devuelve un false en el callback, el archivo no es aceptado por lo que la respuesta del endpoint es undefined
    if (!file) return callback(new Error('File is empty'), false);
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (validExtensions.includes(fileExtension)) {
        return callback(null, true);
    }
    callback(null, true);
}