import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  const navItems = [
    { name: '首页', path: '/' },
    { name: '照片合集', path: '/gallery' },
    { name: '留言板', path: '/guestbook' },
    { name: '我们的AI宝宝', path: '/chat' },
    { name: '关于我们', path: '/about' }
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#efc7c2',
        backdropFilter: 'blur(5px)',
        boxShadow: 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: '#694f5d',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}
          >
            欣原不语...
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                sx={{
                  color: '#694f5d',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 