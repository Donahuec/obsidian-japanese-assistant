import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { AppContext, useApp } from 'src/Context/AppContext';
import { useState, useEffect, useRef } from 'react';
import JPAssistPlugin from 'main';
import Message from 'src/Components/Message';

let history: JPAssistMessage[] = [];
let currentResponse = '';

export interface JPAssistMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface JPAssistReactViewProps {
    plugin: JPAssistPlugin;
}

const JPAssistReactView = ({ plugin }: JPAssistReactViewProps) => {
    const app: App | undefined = useApp();
    const [chat, setChat] = useState<string | null>('');
    const [responses, setResponses] = useState<JPAssistMessage[]>([]);
    const [request, setRequest] = useState<string>('');

    const scrollRef = useRef<HTMLDivElement | null>(null);

    if (!plugin.settings.openAIKey) {
        return <h4>OpenAI Key not set</h4>;
    }

    if (!app) {
        return <h4>App not available</h4>;
    }

    function buildStreamingText(text: string) {
        currentResponse += text;
        setChat(currentResponse);
    }

    function resetStreamingText() {
        currentResponse = '';
        setChat(currentResponse);
    }

    async function sendMessage(text: string, hidden: boolean = false) {
        if (!hidden) {
            history.push({ role: 'user', content: text });
            setResponses(history);
            resetStreamingText();
        }

        buildStreamingText('Generating...');

        console.log(plugin.thread);

        const message = await plugin.client.beta.threads.messages.create(
            plugin.thread.id,
            {
                role: 'user',
                content: text,
            }
        );
        const run = plugin.client.beta.threads.runs
            .stream(plugin.thread.id, {
                assistant_id: plugin.assistant.id,
            })
            .on('textCreated', (_text: any) => {
                resetStreamingText();
            })
            .on(
                'textDelta',
                (textDelta: { value: string | undefined }, _snapshot: any) => {
                    if (textDelta.value !== undefined) {
                        buildStreamingText(textDelta.value);
                    }
                }
            )
            .on('textDone', () => {
                history.push({ role: 'assistant', content: currentResponse });
                setResponses(history);
                resetStreamingText();
            });
    }

    useEffect(() => {
        sendMessage('Please Introduce Yourself', true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendMessage(request, false);
        setRequest(''); // Clear the textarea input
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (
            event.key === 'Enter' &&
            !event.nativeEvent.isComposing &&
            !event.shiftKey
        ) {
            event.preventDefault();
            handleSubmit(event as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    return (
        <div className="jp-assist-container">
            <h1 className="chat-title">Welcome to JPAssist!</h1>
            <div className="chat-content">
                {responses.map((response, index) => (
                    <Message
                        key={index}
                        index={index}
                        role={response.role}
                        content={response.content}
                    />
                ))}
                {chat ? (
                    <Message
                        key={0}
                        index={0}
                        role={'assistant'}
                        content={chat}
                    />
                ) : null}
                <div ref={scrollRef} />
            </div>
            <form className="chat-form" onSubmit={handleSubmit}>
                <textarea
                    className="chat-input"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    onKeyDown={handleKeyDown}
                ></textarea>
                <button type="submit" className="jp-assist-button">
                    Submit
                </button>
            </form>
        </div>
    );
};

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
        this.root.render(
            <AppContext.Provider value={this.app}>
                <JPAssistReactView plugin={this.plugin} />
            </AppContext.Provider>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
