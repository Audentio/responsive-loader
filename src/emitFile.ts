import { interpolateName } from 'loader-utils';
import { getPaths } from './getPaths';

export async function emitFile({ content, context, width }: any) {
    const fileName = interpolateName(context, `img-[hash:6]-${width || 'original'}.[ext]`, {
        content,
    });

    const { output, public: publicPath } = getPaths(fileName);

    context.emitFile(output, content);

    return {
        src: publicPath,
        width: +width,
    };
}
