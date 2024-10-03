import JPAssistPlugin from 'main';
import { PluginSettingTab, App, Setting } from 'obsidian';

export interface JPAssistSettings {
    openAIKey: string;
    assistantKey: string;
    useCustomPrompts: boolean;
    promptPath: string;
    prompts: string[];
}

export const DEFAULT_SETTINGS: JPAssistSettings = {
    openAIKey: '',
    assistantKey: '',
    useCustomPrompts: false,
    promptPath: '',
    prompts: [],
};

export class JPAssistSettingTab extends PluginSettingTab {
    plugin: JPAssistPlugin;

    constructor(app: App, plugin: JPAssistPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Open AI api key')
            .setDesc('Key for Open AI')
            .addText((text) =>
                text
                    .setPlaceholder('Enter your secret')
                    .setValue(this.plugin.settings.openAIKey)
                    .onChange(async (value) => {
                        this.plugin.settings.openAIKey = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Assistant Id')
            .setDesc('Assistant Id for Open AI')
            .addText((text) =>
                text
                    .setPlaceholder('Enter your secret')
                    .setValue(this.plugin.settings.assistantKey)
                    .onChange(async (value) => {
                        this.plugin.settings.assistantKey = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Use Custom Prompts')
            .setDesc('Use custom prompts for the assistant')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.useCustomPrompts)
                    .onChange(async (value) => {
                        this.plugin.settings.useCustomPrompts = value;
                        await this.plugin.saveSettings();
                    });
            });

        new Setting(containerEl)
            .setName('Prompt Path')
            .setDesc('Path to the prompt file')
            .addText((text) =>
                text
                    .setPlaceholder('Enter the path')
                    .setValue(this.plugin.settings.promptPath)
                    .onChange(async (value) => {
                        this.plugin.settings.promptPath = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Prompts')
            .setDesc('List of prompts')
            .addTextArea((text) =>
                text
                    .setPlaceholder('Enter the prompts')
                    .setValue(this.plugin.settings.prompts.join('\n'))
                    .onChange(async (value) => {
                        this.plugin.settings.prompts = value.split('\n');
                        await this.plugin.saveSettings();
                    })
            );
    }
}
