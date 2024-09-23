import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { Root, createRoot } from 'react-dom/client';
import { AppContext, useApp } from 'src/Context/AppContext';
import './JPAssistView.css';
import { OpenAI } from 'openai';

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

let client: OpenAI;
let assistant: OpenAI.Beta.Assistant;
let thread: OpenAI.Beta.Threads.Thread;
// create a mutable list to store the chat history
let history: JPAssistMessage[] = [];

let lastResponse = '';

async function createAssistant(
    openAIKey: string,
    setChat: (text: string) => void,
    setResponses: (responses: JPAssistMessage[]) => void
) {
    client = new OpenAI({
        apiKey: openAIKey,
        dangerouslyAllowBrowser: true, // This is the default and can be omitted
    });
    assistant = await client.beta.assistants.create({
        name: 'Japanese Assistant',
        instructions: systemPrompt,
        model: 'gpt-4o-mini',
    });
    thread = await client.beta.threads.create();
    sendMessage('Please Introduce Yourself', setChat, setResponses);
}

async function sendMessage(
    text: string,
    setChat: (text: string) => void,
    setResponses: (responses: JPAssistMessage[]) => void
) {
    history.push({ role: 'user', content: text });
    setResponses(history);
    setChat(lastResponse);
    const message = await client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: text,
    });
    const run = client.beta.threads.runs
        .stream(thread.id, {
            assistant_id: assistant.id,
        })
        .on('textCreated', (text) => {
            lastResponse = '';
        })
        .on('textDelta', (textDelta, snapshot) => {
            if (textDelta.value !== undefined) {
                lastResponse += textDelta.value;
                setChat(lastResponse);
            }
        })
        .on('textDone', () => {
            history.push({ role: 'assistant', content: lastResponse });
            setResponses(history);
            lastResponse = '';
            setChat(lastResponse);
        });
}

import { useState, useEffect } from 'react';
import JPAssistPlugin from 'main';

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

    plugin.loadSettings();

    const settings = plugin.settings;

    // Call CreateAssistant on first render
    useEffect(() => {
        createAssistant(settings.openAIKey, setChat, setResponses);
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
                    sendMessage(request, setChat, setResponses);
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
