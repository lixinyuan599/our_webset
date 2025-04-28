import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';

const API_URL = 'http://localhost:5001/api';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 发送消息并获取 AI 回复
  const handleSend = async () => {
    if (input.trim()) {
      try {
        setError(null);
        const newMessage = {
          id: Date.now(),
          text: input,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages([...messages, newMessage]);
        setInput('');
        setLoading(true);

        // 准备消息历史
        const messageHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        // 添加当前消息
        messageHistory.push({
          role: 'user',
          content: input
        });

        console.log('Sending request to:', `${API_URL}/chat`);
        console.log('Request body:', { messages: messageHistory });

        // 调用后端API
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ messages: messageHistory })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        if (!response.ok) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = JSON.parse(responseText);
        console.log('AI Response:', data);

        if (data && data.choices && data.choices[0]) {
          const aiResponse = {
            id: Date.now() + 1,
            text: data.choices[0].message.content,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          throw new Error('Invalid response from AI: ' + JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error during API request:", error);
        setError(error.message || '无法获取AI的回复，请稍后再试');
        const aiResponse = {
          id: Date.now() + 1,
          text: '抱歉，无法获取AI的回复，请稍后再试。',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, aiResponse]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, pt: 12 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI对话
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ 
          height: '60vh', 
          display: 'flex', 
          flexDirection: 'column',
          mb: 2
        }}>
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            backgroundColor: '#f5f5f5'
          }}>
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '70%'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: msg.sender === 'user' ? '#1976d2' : '#757575',
                      width: 32,
                      height: 32,
                      mr: msg.sender === 'user' ? 0 : 1,
                      ml: msg.sender === 'user' ? 1 : 0
                    }}
                  >
                    {msg.sender === 'user' ? 'U' : 'AI'}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: msg.sender === 'user' ? '#e3f2fd' : '#f5f5f5'
                    }}
                  >
                    <Typography variant="body1">{msg.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {msg.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入消息..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
              />
              <Button 
                variant="contained" 
                onClick={handleSend}
                disabled={!input.trim() || loading}
              >
                发送
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Chat; 