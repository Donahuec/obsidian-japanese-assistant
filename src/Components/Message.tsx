interface MessageProps {
    index: number;
    role: string;
    content: string;
}

const Message: React.FC<MessageProps> = ({ index, role, content }) => {
    return (
        <div key={index} className={role + ' message'}>
            <b className="user-name">
                {role === 'user' ? 'You' : 'JP Assistant'}
            </b>
            <br />
            <p className="message-content">
                <span dangerouslySetInnerHTML={{ __html: content }} />
            </p>
        </div>
    );
};

export default Message;
