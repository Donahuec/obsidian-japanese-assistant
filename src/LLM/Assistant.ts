import JPAssistPlugin from 'main';
import OpenAI from 'openai';
import { systemPrompt } from 'src/Prompts/System';
import { JPAssistSettings } from 'src/Settings/Settings';

export class Assistant {
    public name: string = 'Japanese Assistant';
    public instructions: string = systemPrompt;
    public model: string = 'gpt-4o-mini';
    public config: any;
    public assistant: OpenAI.Beta.Assistant;
    public id: string;

    constructor(private plugin: JPAssistPlugin, private client: OpenAI) {
        this.config = {
            name: this.name,
            instructions: systemPrompt,
            model: this.model,
        };
    }

    public async createAssistant(): Promise<string> {
        this.assistant = await this.client.beta.assistants.create(this.config);
        this.plugin.settings.assistantKey = this.assistant.id;
        this.id = this.assistant.id;
        return this.assistant.id;
    }

    public async updateAssistant(): Promise<string> {
        this.assistant = await this.client.beta.assistants.update(
            this.plugin.settings.assistantKey,
            { instructions: this.instructions }
        );
        this.id = this.assistant.id;
        return this.assistant.id;
    }
}
