import { Plugin, WorkspaceLeaf } from 'obsidian';
import {
    DEFAULT_SETTINGS,
    JPAssistSettings,
    JPAssistSettingTab,
} from './src/Settings/Settings';
import { JP_ASSIST_VIEW, JPAssistView } from 'src/Views/JPAssistView';

export default class JPAssistPlugin extends Plugin {
    settings: JPAssistSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(JP_ASSIST_VIEW, (leaf) => new JPAssistView(leaf));

        this.addRibbonIcon('languages', 'Japanese Assistant', () => {
            this.activateView();
        });

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-jp-assist',
            name: 'Open Japanese Assistant',
            callback: () => {
                this.activateView();
            },
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new JPAssistSettingTab(this.app, this));
    }

    onunload() {}

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(JP_ASSIST_VIEW);

        if (leaves.length > 0) {
            // A leaf with our view already exists, use that
            leaf = leaves[0];
        } else {
            // Our view could not be found in the workspace, create a new leaf
            // in the right sidebar for it
            leaf = workspace.getRightLeaf(false);

            await leaf?.setViewState({ type: JP_ASSIST_VIEW, active: true });
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
