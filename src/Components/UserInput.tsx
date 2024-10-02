import { useState } from 'react';

interface UserInputProps {
    callback: Function;
}

const UserInput: React.FC<UserInputProps> = ({ callback }) => {
    const [request, setRequest] = useState<string>('');

    // event handling
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        callback(request, false);
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
    );
};

export default UserInput;
