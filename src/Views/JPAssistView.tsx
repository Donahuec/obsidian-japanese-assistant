import { ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext, useApp } from "src/Context/AppContext";

const JPAssistReactView = () => {
	const app = useApp();

	if (!app) {
		return <h4>App not available</h4>;
	}

	return (
		<div>
			<h4>{app.vault.getName()}</h4>
			<p>Welcome to JPAssist!</p>
		</div>
	);
};

export const JP_ASSIST_VIEW = "jp-assist-view";

export class JPAssistView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return JP_ASSIST_VIEW;
	}

	getDisplayText() {
		return "Japanese Assistant... With React!";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<JPAssistReactView />
			</AppContext.Provider>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
