import JPAssistPlugin from 'main';
import { App } from 'obsidian';
import { useState, useEffect, useRef } from 'react';
import { useApp } from 'src/Context/AppContext';
import Message from './Message';
import UserInput from './UserInput';

let history: JPAssistMessage[] = [];
let currentResponse = '';

export interface JPAssistMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    plugin: JPAssistPlugin;
}

const Chat = ({ plugin }: ChatProps) => {
    const app: App | undefined = useApp();
    const [chat, setChat] = useState<string | null>('');
    const [responses, setResponses] = useState<JPAssistMessage[]>([]);

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

        await plugin.client.createMessage('user', text);

        plugin.client
            .runWithStream()
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
        sendMessage(
            'What is the most important thing to learn about the Japanese Language?',
            true
        );
    }, []);

    // Auto scroll to the bottom of the chat
    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chat]);

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
            <UserInput callback={sendMessage} />
        </div>
    );
};

export default Chat;
