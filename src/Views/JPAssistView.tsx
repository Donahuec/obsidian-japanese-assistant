import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { AppContext, useApp } from 'src/Context/AppContext';
import './JPAssistView.css';
import { OpenAI } from 'openai';
import { useState, useEffect } from 'react';
import JPAssistPlugin from 'main';

export interface JPAssistMessage {
    role: 'user' | 'assistant';
    content: string;
}

const systemPrompt = `You are a native Japanese Speaker named Mariko-Sensei tutoring English Speaking students learning Japanese. 
	You are a helpful tutor to Japanese learners, and always make sure your aid aligns with modern spoken Japanese. 
	You provide explanations and conversation in English, since your students are early in their learning journey. 
	You only provide Pronunciation guides when you use kanji, because you want your student to become familiar with reading kanji. 
	When you provide pronunciation guides, they are provided in hiragana format and NEVER romaji. 
	You also like to provide cultural context when possible.
	Any text styling should use html tags. 
	For instance, bold text should be wrapped in <b> tags, and italics should be wrapped in <em> tags.
	NEVER use markdown syntax.
	Avoid large blocks of text. Use short, concise sentences.
	Use formatting such as <br> tags and bullet points, using <ul></ul> and <ol></ol> formatting to make your responses easier to read.
	Your students are early in their learning journey, so you should avoid using complex kanji.
	You should always provide a response in English.
	`;

interface JPAssistReactViewProps {
    plugin: JPAssistPlugin;
}

const JPAssistReactView = ({ plugin }: JPAssistReactViewProps) => {
    const defaultRequest = '';
    const app: App | undefined = useApp();
    const [chat, setChat] = useState<string | null>('');
    const [responses, setResponses] = useState<JPAssistMessage[]>([]);
    const [request, setRequest] = useState<string>(defaultRequest);
    let tr = '';

    let history: JPAssistMessage[] = [];
    let currentResponse = '';

    plugin.loadSettings();
    const settings = plugin.settings;
    if (!settings.openAIKey) {
        return <h4>OpenAI Key not set</h4>;
    }

    let client: OpenAI = new OpenAI({
        apiKey: settings.openAIKey,
        dangerouslyAllowBrowser: true, // This is the default and can be omitted
    });
    let assistant: OpenAI.Beta.Assistant;
    let thread: OpenAI.Beta.Threads.Thread;

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

        const message = await client.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: text,
        });
        const run = client.beta.threads.runs
            .stream(thread.id, {
                assistant_id: assistant.id,
            })
            .on('textCreated', (text) => {
                resetStreamingText;
            })
            .on('textDelta', (textDelta, snapshot) => {
                if (textDelta.value !== undefined) {
                    buildStreamingText(textDelta.value);
                }
            })
            .on('textDone', () => {
                history.push({ role: 'assistant', content: currentResponse });
                setResponses(history);
                resetStreamingText();
            });
    }

    // Call CreateAssistant on first render
    useEffect(() => {
        async function createAssistant() {
            assistant = await client.beta.assistants.create({
                name: 'Japanese Assistant',
                instructions: systemPrompt,
                model: 'gpt-4o-mini',
            });
            thread = await client.beta.threads.create();
            sendMessage('Please Introduce Yourself', true);
        }

        createAssistant();
    }, []);

    if (!app) {
        return <h4>App not available</h4>;
    }

    return (
        <div className="jp-assist-container">
            <h1 className="chat-title">Welcome to JPAssist!</h1>
            <div className="chat-content">
                {responses.map((response, index) => (
                    <p key={index} className={response.role + '-message'}>
                        <b>
                            {response.role === 'user'
                                ? 'You: '
                                : 'JP Assistant: '}
                        </b>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: response.content,
                            }}
                        />
                    </p>
                ))}
                <p
                    className="assistant message"
                    dangerouslySetInnerHTML={{
                        __html: chat || '',
                    }}
                ></p>
            </div>
            <textarea
                className="chat-input"
                style={{
                    width: '100%',
                    height: '100px',
                }}
                defaultValue={tr}
                onChange={(e) => {
                    setRequest(e.target.value);
                }}
            ></textarea>
            <button
                onClick={() => {
                    sendMessage(request, false);
                }}
                className="jp-assist-button"
            >
                Submit
            </button>
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
        return 'Japanese Assistant... With React!';
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
