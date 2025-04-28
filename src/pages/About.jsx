import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  Grid,
  Avatar
} from '@mui/material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ 
      // 设置页面的背景图片
      backgroundImage: 'url("images/IMG_6369.JPG")', // 替换为你的背景图片路径
      backgroundSize: 'cover', 
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh', // 让背景覆盖整个页面
    }}>
      <Box sx={{ py: 4, pt: 12, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{color:'#694f5d'}}>
          关于我们
        </Typography>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                  border: '4px solid #694f5d'
                }}
                alt="个人照片"
                src="images/IMG_6112.JPG" // 请替换为您的实际照片路径
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{color:'#694f5d'}}>
                  溜溜姐和七七哥
                </Typography>
                <Typography variant="body1" paragraph sx={{color:'#694f5d'}}>
                  相识于2024年9月30日，相恋于遇见后的每一分每一秒！
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{color:'#694f5d'}}>
                  因为溜溜姐不善言辞，所以决定制作这个网站，记录我们的点点滴滴！
                </Typography>
                <Typography variant="body1" paragraph sx={{color:'#694f5d'}}>
                  • 剩下的交给七七哥吧
                  <br />
                  • 
                  <br />
                  • 
                </Typography>
              </Box>

              <Box>
                <Typography variant="h5" gutterBottom sx={{color:'#694f5d'}}>
                  恋爱宣言
                </Typography>
                <Typography variant="body1" paragraph sx={{color:'#694f5d'}}>
                  希望爱不被时间盖去！（2024.10.20 于武汉欢乐谷记）
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default About;
