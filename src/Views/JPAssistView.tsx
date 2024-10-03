import { ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { PluginContext } from 'src/Context/Context';
import JPAssistPlugin from 'main';
import Chat from 'src/Components/Chat';

export const JP_ASSIST_VIEW = 'jp-assist-view';

export class JPAssistView extends ItemView {
    root: Root | null = null;
    plugin: JPAssistPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: JPAssistPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return JP_ASSIST_VIEW;
    }

    getDisplayText() {
        return 'Japanese Assistant';
    }

    async onOpen() {
        this.root = createRoot(this.containerEl.children[1]);
        if (!this.app) {
            this.root.render(<h4>App not available</h4>);
        } else if (!this.plugin.settings.openAIKey) {
            this.root.render(<h4>OpenAI Key not set</h4>);
        } else {
            this.root.render(
                <PluginContext.Provider value={this.plugin}>
                    <Chat />
                </PluginContext.Provider>
            );
        }
    }

    async onClose() {
        this.root?.unmount();
    }
}
