import React from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';

const Home = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      backgroundImage: 'url(/images/IMG_6300.JPG)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100vh', pt: 8 }}>
        <Box sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          py: 4
        }}>
          <Paper elevation={3} sx={{ 
            p: 4,
            width: '100%',
            maxWidth: 800,
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold',
              color: '#694f5d'
            }}>
              欢迎来到溜溜姐和七七哥的小世界
            </Typography>
            <Typography variant="h5" component="p" sx={{ 
              mb: 4,
              color: '#694f5d'
            }}>
              这里溜溜姐和七七哥的日常生活
            </Typography>
            <Box
              component="img"
              sx={{
                height: 300,
                width: 300,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #694f5d'
              }}
              alt="个人照片"
              src="/images/IMG_6300.JPG"
            />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 