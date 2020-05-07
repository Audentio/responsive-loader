import fs from 'fs';
import path from 'path';
import compiler from './compiler';

test('Emit file as-is when size is not defined', async () => {
    const imageStats = fs.statSync(path.join(__dirname, 'image.jpeg'));
    const stats = await compiler('image.jpeg');
    const assets = stats.toJson().assets;

    // check that only bundle.js and one image are emitted
    expect(assets.length).toBe(2);

    // check that emitted image is identical in size
    expect(assets.find(asset => asset.size === imageStats.size).emitted).toBe(true);
});

test('Only resize for sizes smaller than original. use original for rest', async () => {
    const stats = await compiler('image.png?sizes[]=200,sizes[]=2000');

    // check that only bundle.js and two images are emitted
    expect(stats.toJson().assets.length).toBe(3);
});
