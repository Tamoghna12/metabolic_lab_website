import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DATA_FILES } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getData() {
    const baseDir = path.join(__dirname, '..', 'data');

    const [publications, team, news, projects, testimonials] = await Promise.all(
        DATA_FILES.map((file) => readJson(path.join(baseDir, file)))
    );

    return { publications, team, news, projects, testimonials };
}

async function readJson(filePath) {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
}
