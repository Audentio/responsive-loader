import path from 'path';

export function getPaths(fileName) {
    return {
        output: path.posix.join('', fileName),
        public: `__webpack_public_path__ + ${JSON.stringify(fileName)}`,
    };
}
