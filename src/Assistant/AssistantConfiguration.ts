import * as fs from 'fs';

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
    public systemPrompt: string;
    public promptFile: string = 'src/Prompts/System.txt';
    public name: string = 'Japanese Assistant';
    public instructions: string;
    public model: string = 'gpt-4o-mini';
    public config: any;

    constructor() {
        this.loadSystemPrompt(this.promptFile);

        this.config = {
            name: this.name,
            instructions: this.systemPrompt,
            model: this.model,
        };
    }

    private async loadSystemPrompt(filePath: string) {
        try {
            this.systemPrompt = await loadTextFile(filePath);
        } catch (err) {
            console.error('Error loading system prompt:', err);
            this.systemPrompt = ''; // Fallback to an empty string or handle as needed
        }
    }
}
