import { App } from 'obsidian';
import { useRef } from 'react';
import Markdown from 'react-markdown';

interface MessageProps {
    index: number;
    role: string;
    content: string;
}

const Message: React.FC<MessageProps> = ({ index, role, content }) => {
    const containerRef = useRef<HTMLParagraphElement | null>(null);

    return (
        <div key={index} className={role + ' message'}>
            <b className="user-name">
                {role === 'user' ? 'You' : 'JP Assistant'}
            </b>
            <br />
            <div className="message-content" ref={containerRef}>
                <Markdown>{content}</Markdown>
            </div>
        </div>
    );
};

export default Message;
