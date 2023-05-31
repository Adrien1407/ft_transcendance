import { NotAcceptableException } from "@nestjs/common";
import { extname } from "path";

interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

export const imageFileFilter = (_: any, file: File, callback: (error: Error, acceptFile: boolean) => void) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new NotAcceptableException('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export const editFileName = (_: any, file: File, callback: (error: Error, filename: string) => void) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
};
