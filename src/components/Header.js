import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Science,
  Business,
  Assessment,
  Info,
  Menu as MenuIcon,
  Source
} from '@mui/icons-material';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: <Assessment sx={{ fontSize: 20 }} />,
      description: 'Overview & Analytics'
    },
    {
      path: '/drug-search',
      label: 'Drug Search',
      icon: <Science sx={{ fontSize: 20 }} />,
      description: 'Pharmaceutical Analysis'
    },
    {
      path: '/company-search',
      label: 'Company Search',
      icon: <Business sx={{ fontSize: 20 }} />,
      description: 'Company Intelligence'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: <Assessment sx={{ fontSize: 20 }} />,
      description: 'Generated Reports'
    },
    {
      path: '/sources',
      label: 'Sources',
      icon: <Source sx={{ fontSize: 20 }} />,
      description: 'Report Sources'
    },
    {
      path: '/api-info',
      label: 'API Info',
      icon: <Info sx={{ fontSize: 20 }} />,
      description: 'Documentation'
    },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0, sm: 2 } }}>
          {/* Logo and Brand */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              flexGrow: 1
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                mr: 2,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Science sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Cognito AI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Pharmaceutical Intelligence
              </Typography>
            </Box>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "contained" : "text"}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'primary.dark'
                        : 'rgba(37, 99, 235, 0.08)',
                      transform: 'translateY(-1px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    ...(isActive && {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                      }
                    })
                  }}
                >
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                    {item.label}
                    {isActive && (
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                    {item.icon}
                  </Box>
                </Button>
              );
            })}
          </Box>

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              sx={{ ml: 1, minWidth: 'auto' }}
              onClick={() => {
                // TODO: Implement mobile menu drawer
                console.log('Mobile menu clicked');
              }}
            >
              <MenuIcon />
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
