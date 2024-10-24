import React, { useEffect, useState, useRef } from 'react';
import modeUrl from '../../ModeUrl';
import ReactMarkdown from 'react-markdown';

interface Message {
    name: string;
    prompt: string;
}

interface ChatBoxProps {
    userFirstName: string;
}

function ChatBox(props: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Automatically scroll to the bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Function to send the "Introduce yourself" message, but not show it on the screen
    useEffect(() => {
        const introduceMessage = async () => {
            const initialMessage = { name: props.userFirstName, prompt: 'Introduce yourself.' };
            await sendMessageToAI(initialMessage); // Send introduction but don't show in messages
        };
        introduceMessage();
    }, [props.userFirstName]);

    // Fetch AI response
    const sendMessageToAI = async (userMessage: Message) => {
        setLoading(true);
        const token = 'Bearer ' + localStorage.getItem('token');

        try {
            const response = await fetch(modeUrl + '/hike-buddy/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(userMessage),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('AI response:', data);

            if (data.choices[0].message) {
                const newMessage: Message = { name: 'Hike Buddy', prompt: data.choices[0].message.content};
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        } catch (error) {
            console.error('Error fetching AI message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (userInput.trim() === '') return; // Prevent empty messages

        const newUserMessage: Message = { name: props.userFirstName, prompt: userInput };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setUserInput(''); // Clear input field
        await sendMessageToAI(newUserMessage); // Send user message to AI and get response
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Chat messages container */}
            <div
                style={{
                    width: '100%',
                    height: '400px',
                    overflowY: 'scroll',
                    backgroundColor: '#f1f1f1',
                    padding: '10px',
                    borderRadius: '5px',
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            backgroundColor: message.name === props.userFirstName? 'grey' : 'green',
                            alignSelf: message.name === props.userFirstName ? 'flex-end' : 'flex-start',
                            textAlign: message.name === props.userFirstName ? 'right' : 'left',
                            width: '80%',
                            margin: '5px',
                            padding: '10px',
                            borderRadius: '5px',
                            color: 'white',
                        }}
                    >
                        <strong>{message.name}</strong>: 
                        {message.name === 'Hike Buddy' ? (
                            <ReactMarkdown>{message.prompt}</ReactMarkdown> // Render markdown for AI messages
                        ) : (
                            message.prompt
                        )}
                    </div>
                ))}
                {loading && <div>Waiting...</div>}
                <div ref={messagesEndRef} />
            </div>

            {/* User input form */}
            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', marginTop: '10px', width: '100%', justifyContent: 'center' }}
            >
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask something..."
                    style={{ width: '80%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit">
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatBox;
