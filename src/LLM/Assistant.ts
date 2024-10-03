import JPAssistPlugin from 'main';
import { normalizePath, Notice, TFile } from 'obsidian';
import OpenAI from 'openai';
import { systemPrompt } from 'src/Prompts/System';

export class Assistant {
    public name: string = 'Japanese Assistant';
    public instructions: string = systemPrompt;
    public assistant: OpenAI.Beta.Assistant;
    public id: string;

    constructor(private plugin: JPAssistPlugin, private client: OpenAI) {}

    public async initializeConfig(): Promise<void> {
        if (this.plugin.settings.useCustomPrompts) {
            this.instructions = await this.getCustomSystemPrompts();
        }
    }

    public async getCustomSystemPrompts(): Promise<string> {
        const folder = this.plugin.app.vault.getFolderByPath(
            normalizePath(this.plugin.settings.promptPath)
        );
        if (!folder) {
            new Notice(
                `Prompt folder '${this.plugin.settings.promptPath}' not found. defaulting to built-in prompts`
            );
            return systemPrompt;
        }
        const files = folder.children;

        if (files.length === 0) {
            new Notice('No prompt files found. defaulting to built-in prompts');
            return systemPrompt;
        }

        if (files.length === 1) {
            return await this.plugin.app.vault.read(files[0] as TFile);
        }

        if (this.plugin.settings.prompts.length > 0) {
            let outputs = [];
            for (let prompt of this.plugin.settings.prompts) {
                const file = files.find((file) => {
                    return file.name === prompt;
                });
                if (file) {
                    outputs.push(
                        await this.plugin.app.vault.read(file as TFile)
                    );
                }
            }
            return outputs.join('\n\n');
        }
        new Notice('no predefined prompts, looking for system.md');
        for (let file of files) {
            if (file.name === 'system.md') {
                return await this.plugin.app.vault.read(file as TFile);
            }
        }
        new Notice('system.md not found. defaulting to built-in prompts');
        return systemPrompt;
    }

    public async createAssistant(): Promise<string> {
        this.assistant = await this.client.beta.assistants.create({
            name: this.name + ' - ' + this.plugin.app.vault.getName(),
            instructions: this.instructions,
            model: this.plugin.settings.model,
        });
        this.plugin.settings.assistantKey = this.assistant.id;
        this.id = this.assistant.id;
        return this.assistant.id;
    }

    public async updateAssistant(): Promise<string> {
        this.assistant = await this.client.beta.assistants.update(
            this.plugin.settings.assistantKey,
            {
                instructions: this.instructions,
                model: this.plugin.settings.model,
            }
        );
        this.id = this.assistant.id;
        return this.assistant.id;
    }
}
