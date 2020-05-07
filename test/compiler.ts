import { createFsFromVolume, Volume } from 'memfs';
import joinPath from 'memory-fs/lib/join';
import path from 'path';
import webpack from 'webpack';

function ensureWebpackMemoryFs(fs) {
    // Return it back, when it has Webpack 'join' method
    if (fs.join) {
        return fs;
    }

    // Create FS proxy, adding `join` method to memfs, but not modifying original object
    const nextFs = Object.create(fs);
    nextFs.join = joinPath;

    return nextFs;
}

export default (fixture, options = {}) => {
    const compiler = webpack({
        context: __dirname,
        entry: `./${fixture}`,
        output: {
            path: path.resolve(__dirname),
            filename: 'bundle.js',
        },
        module: {
            rules: [
                {
                    test: /\.jpeg|png|jpg$/,
                    use: {
                        loader: path.resolve(__dirname, '../src/loader.ts'),
                    },
                },
            ],
        },
    });

    compiler.outputFileSystem = ensureWebpackMemoryFs(createFsFromVolume(new Volume()));

    return new Promise<webpack.Stats>((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) reject(err);
            if (stats && stats.hasErrors()) reject(new Error(stats.toJson().errors));

            resolve(stats);
        });
    });
};
