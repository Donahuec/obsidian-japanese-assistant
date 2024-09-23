import JPAssistPlugin from 'main';
import { PluginSettingTab, App, Setting } from 'obsidian';

export interface JPAssistSettings {
    openAIKey: string;
}

export const DEFAULT_SETTINGS: JPAssistSettings = {
    openAIKey: '',
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
    }
}
