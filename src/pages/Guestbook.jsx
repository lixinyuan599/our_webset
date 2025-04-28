import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

const Guestbook = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // 从 localStorage 加载留言
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('guestbookMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (err) {
      console.error('Error loading messages from localStorage:', err);
      setError('无法加载留言');
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存留言到 localStorage
  const saveMessages = (newMessages) => {
    try {
      localStorage.setItem('guestbookMessages', JSON.stringify(newMessages));
    } catch (err) {
      console.error('Error saving messages to localStorage:', err);
      setError('无法保存留言');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && message) {
      try {
        const newMessage = {
          id: Date.now(),
          name,
          content: message,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [newMessage, ...messages];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);
        
        setName('');
        setMessage('');
        setSnackbar({
          open: true,
          message: '留言成功！',
          severity: 'success'
        });
      } catch (err) {
        console.error('Error saving message:', err);
        setSnackbar({
          open: true,
          message: '留言失败，请稍后重试',
          severity: 'error'
        });
      }
    }
  };

  const handleDelete = (id) => {
    try {
      const updatedMessages = messages.filter(msg => msg.id !== id);
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setSnackbar({
        open: true,
        message: '留言已删除',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting message:', err);
      setSnackbar({
        open: true,
        message: '删除失败，请稍后重试',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, pt: 12, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, pt: 12 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          留言板
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="您的姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="留言内容"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                multiline
                rows={4}
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ alignSelf: 'flex-end' }}
              >
                提交留言
              </Button>
            </Box>
          </form>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <List>
            {messages.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" color="text.secondary" align="center">
                      暂无留言
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="span">
                            {msg.name}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(msg.id)}
                          >
                            删除
                          </Button>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {msg.content}
                          </Typography>
                          <Typography
                            component="div"
                            variant="caption"
                            color="text.secondary"
                          >
                            {new Date(msg.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Guestbook; 