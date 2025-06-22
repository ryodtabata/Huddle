import React, { useState } from 'react';

const mockMessages = [
  { id: 1, sender: 'Alice', text: 'Hey there!', time: '10:00 AM' },
  { id: 2, sender: 'Me', text: 'Hi Alice!', time: '10:01 AM' },
  { id: 3, sender: 'Bob', text: 'Hello everyone!', time: '10:02 AM' },
];

const MessagesComponent = ({ groupName = 'Chat', currentUser = 'Me' }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: currentUser,
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setInput('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{groupName}</h2>
      <div style={styles.messagesList}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              alignSelf: msg.sender === currentUser ? 'flex-end' : 'flex-start',
              background: msg.sender === currentUser ? '#4fc3f7' : '#eee',
              color: msg.sender === currentUser ? '#fff' : '#222',
            }}
          >
            <div style={styles.sender}>
              {msg.sender !== currentUser && msg.sender}
            </div>
            <div>{msg.text}</div>
            <div style={styles.time}>{msg.time}</div>
          </div>
        ))}
      </div>
      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button style={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    height: '80vh',
    border: '1px solid #ddd',
    borderRadius: 12,
    background: '#fafbfc',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
  header: {
    margin: 0,
    padding: '16px',
    borderBottom: '1px solid #eee',
    background: '#232a36',
    color: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  } as React.CSSProperties,
  messagesList: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto' as React.CSSProperties['overflowY'],
    display: 'flex',
    flexDirection: 'column' as React.CSSProperties['flexDirection'],
    gap: '10px',
  } as React.CSSProperties,
  message: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: 16,
    marginBottom: 4,
    fontSize: 15,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    wordBreak: 'break-word' as React.CSSProperties['wordBreak'],
  } as React.CSSProperties,
  sender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  } as React.CSSProperties,
  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textAlign: 'right' as React.CSSProperties['textAlign'],
  } as React.CSSProperties,
  inputRow: {
    display: 'flex',
    borderTop: '1px solid #eee',
    padding: '12px',
    background: '#fff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  } as React.CSSProperties,
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: 20,
    border: '1px solid #ccc',
    fontSize: 15,
    outline: 'none',
    marginRight: 8,
  } as React.CSSProperties,
  sendButton: {
    background: '#4fc3f7',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '10px 18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: 15,
  } as React.CSSProperties,
};

export default MessagesComponent;
