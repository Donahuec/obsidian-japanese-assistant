import * as fs from 'fs';
import { systemPrompt } from 'src/Prompts/System';

async function loadTextFile(filePath: string): Promise<string> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

export class AssistantConfiguration {
    public name: string = 'Japanese Assistant';
    public instructions: string = systemPrompt;
    public model: string = 'gpt-4o-mini';
    public config: any;

    constructor() {
        this.config = {
            name: this.name,
            instructions: systemPrompt,
            model: this.model,
        };
    }
}
