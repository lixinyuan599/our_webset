const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();

// 配置
const PORT = 5001;
const MONGODB_URI = 'mongodb://localhost:27017/guestbook';
const ZHIPUAI_API_KEY = '5d2b2e2be448451ca8028f1cdd4ce954.vDUSJ1WJX0ZAHL1P';

// 中间件
app.use(cors());

app.use(express.json());

// 连接MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// 定义留言模型
const messageSchema = new mongoose.Schema({
  name: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API路由
// 获取所有留言
app.get('/api/messages', async (req, res) => {
  try {
    console.log('Fetching messages...');
    const messages = await Message.find().sort({ timestamp: -1 });
    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: error.message });
  }
});

// 添加新留言
app.post('/api/messages', async (req, res) => {
  try {
    console.log('Received new message:', req.body);
    const message = new Message({
      name: req.body.name,
      content: req.body.content
    });
    const savedMessage = await message.save();
    console.log('Message saved:', savedMessage);
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(400).json({ message: error.message });
  }
});

// AI聊天接口
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    console.log('Received chat request:', messages);

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Invalid messages format');
    }

    console.log('Sending request to ZhipuAI...');

    try {
      // 确保消息格式正确
      const formattedMessages = messages.map(msg => ({
        role: msg.role || (msg.sender === 'user' ? 'user' : 'assistant'),
        content: msg.content || msg.text
      }));

      console.log('Formatted messages:', formattedMessages);

      const response = await axios.post(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        {
          model: 'glm-4-flash-250414',
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1500,
          stream: false,
          do_sample: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ZHIPUAI_API_KEY}`
          }
        }
      );

      console.log('AI Response:', response.data);
      res.json(response.data);
    } catch (aiError) {
      console.error('ZhipuAI API Error:', aiError);
      console.error('Error details:', {
        name: aiError.name,
        message: aiError.message,
        stack: aiError.stack,
        response: aiError.response?.data
      });

      // 检查是否是网络错误
      if (aiError.message.includes('Connection error')) {
        throw new Error('无法连接到智谱AI服务器，请检查网络连接或稍后重试');
      }

      throw new Error(`ZhipuAI API Error: ${aiError.message}`);
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: error.message,
      error: error.toString(),
      details: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.toString(),
    details: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 