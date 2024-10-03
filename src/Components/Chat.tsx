import JPAssistPlugin from 'main';
import { useState, useEffect, useRef } from 'react';
import { usePlugin } from 'src/Context/Context';
import Message from './Message';
import UserInput from './UserInput';

let history: JPAssistMessage[] = [];

export interface JPAssistMessage {
    role: 'user' | 'assistant';
    content: string;
}

const Chat = () => {
    const plugin: JPAssistPlugin = usePlugin() as JPAssistPlugin;
    const [responses, setResponses] = useState<JPAssistMessage[]>([]);
    const [status, setStatus] = useState<string>('idle');
    const [ellipsis, setEllipsis] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setEllipsis((prev) => {
                if (prev.length < 3) {
                    return prev + '.';
                } else {
                    return '';
                }
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    async function sendMessage(text: string, hidden: boolean = false) {
        if (!hidden) {
            history.push({ role: 'user', content: text });
            setResponses(history);
        }
        setStatus('sending');

        await plugin.client.createMessage('user', text);

        plugin.client
            .runWithStream()
            .on('textCreated', (_text: any) => {
                setStatus('generating');
            })
            .on('textDone', (text: any) => {
                setStatus('idle');
                history.push({ role: 'assistant', content: text.value });
                setResponses(history);
            });
    }

    // Auto scroll to the bottom of the chat
    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [status]);

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
                {status != 'idle' ? (
                    <span>
                        <Message
                            key={0}
                            index={0}
                            role={'assistant'}
                            content={status + ellipsis}
                        />
                    </span>
                ) : null}
                <div ref={scrollRef} />
            </div>
            <UserInput callback={sendMessage} />
        </div>
    );
};

export default Chat;
