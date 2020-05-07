import sharp from 'sharp';

export class SharpProcessor {
    img: sharp.Sharp;

    constructor(source: string | Buffer) {
        this.img = sharp(source);
    }

    metadata() {
        return this.img.metadata();
    }

    resize(size: number) {
        return this.img
            .clone()
            .resize(size)
            .toBuffer();
    }
}
