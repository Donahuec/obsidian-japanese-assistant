import OpenAI from 'openai';
import { Assistant } from './Assistant';
import JPAssistPlugin from 'main';
import { AssistantStream } from 'openai/lib/AssistantStream';

export class OpenAIClient {
    public client: OpenAI;
    public assistant: Assistant;
    public thread: OpenAI.Beta.Thread;

    constructor(private plugin: JPAssistPlugin) {
        this.client = new OpenAI({
            apiKey: this.plugin.settings.openAIKey,
            dangerouslyAllowBrowser: true,
        });
    }

    public async initializeSession() {
        await this.initializeAssistant();
        await this.initializeThread();
    }

    public async initializeAssistant() {
        this.assistant = new Assistant(this.plugin, this.client);

        if (this.plugin.settings.assistantKey) {
            await this.assistant.updateAssistant();
        } else {
            let id = await this.assistant.createAssistant();
            this.plugin.settings.assistantKey = id;
            this.plugin.saveSettings();
        }
    }

    public async initializeThread() {
        this.thread = await this.client.beta.threads.create();
    }

    public async createMessage(role: 'user' | 'assistant', text: string) {
        return await this.client.beta.threads.messages.create(this.thread.id, {
            role: role,
            content: text,
        });
    }

    public runWithStream(): AssistantStream {
        return this.client.beta.threads.runs.stream(this.thread.id, {
            assistant_id: this.assistant.id,
        });
    }
}
