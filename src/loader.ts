import { getOptions, parseQuery } from 'loader-utils';
import validateOptions from 'schema-utils';
import { emitFile } from './emitFile';
import { SharpProcessor } from './processors/sharp';

const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};

async function processImage({ source, context, options, loaderCallback }) {
    const img = new SharpProcessor(source);
    const { sizes = [] } = context.resourceQuery ? parseQuery(context.resourceQuery) : {};

    const metadata = await img.metadata();

    // emit source as-is first
    const sourceImage = await emitFile({ content: source, context, options, width: metadata.width });

    const images = await Promise.all(
        sizes.map(size => {
            // only emit sizes that are smaller than source image
            if (size < metadata.width) {
                // resize file
                return new Promise(resolve => {
                    img.resize(+size)
                        .then(content => emitFile({ content, options, context, width: size }))
                        .then(result => {
                            resolve(result);
                        });
                });
            }

            // use source as-is
            return new Promise(resolve => {
                resolve(sourceImage);
            });
        })
    );

    const output = {
        images,
    };

    console.log(images);

    loaderCallback(
        null,
        `
        export default {
            src: ${sourceImage.src},
            width: ${metadata.width},
            height: ${metadata.height},
            images: ${JSON.stringify(images)},
            toString() {
                return '${sourceImage.src}'
            }
        }
        `
    );
}

export default function(source) {
    const context: any = this;
    const loaderCallback = this.async();
    const parsedResourceQuery = this.resourceQuery ? parseQuery(this.resourceQuery) : {};
    const options = { ...getOptions(this), ...parsedResourceQuery };

    // @ts-ignore
    validateOptions(schema, options || {}, { name: '@audentio/responsive-loader' });

    processImage({
        source,
        options,
        context,
        loaderCallback,
    });
}

export const raw = true;
