import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Chip, 
  LinearProgress, 
  Alert,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Science, 
  Business, 
  Assessment, 
  Speed, 
  TrendingUp, 
  Storage, 
  Api, 
  CheckCircle, 
  Error,
  Refresh,
  Launch,
  Analytics,
  Psychology,
  DataUsage
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { generalAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState({ loading: true, healthy: false });
  const [apiInfo, setApiInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      setError(null);
      const [healthRes, infoRes] = await Promise.all([
        generalAPI.health(),
        generalAPI.info()
      ]);
      
      const isHealthy = healthRes.data?.status === 'healthy' || healthRes.data?.status === 'warning';
      
      setApiStatus({ loading: false, healthy: isHealthy });
      // Ensure we're setting a string or null, not an object
      const apiInfoData = infoRes.data?.data || infoRes.data;
      setApiInfo(typeof apiInfoData === 'object' ? apiInfoData : null);
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus({ loading: false, healthy: false });
      setError(typeof error.userMessage === 'string' ? error.userMessage : 'Failed to connect to API');
    }
  };

  const features = [
    {
      title: 'Drug Analysis',
      description: 'Comprehensive pharmaceutical intelligence with advanced AI-powered analysis',
      icon: <Science sx={{ fontSize: 32, color: 'primary.main' }} />,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      endpoints: ['Comprehensive'],
      stats: 'Comprehensive Analysis',
      action: () => navigate('/drug-search')
    },
    {
      title: 'Company Intelligence',
      description: 'Deep dive into pharmaceutical companies and their portfolios',
      icon: <Business sx={{ fontSize: 32, color: 'secondary.main' }} />,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      endpoints: ['Comprehensive'],
      stats: 'Comprehensive Analysis',
      action: () => navigate('/company-search')
    },
    {
      title: 'AI-Powered Insights',
      description: 'GPT-4o enhanced search with LangChain validation',
      icon: <Psychology sx={{ fontSize: 32, color: 'success.main' }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      endpoints: ['Real-time Search', 'Validation', 'Enhancement'],
      stats: 'Advanced AI',
      action: () => navigate('/api-info')
    },
    {
      title: 'Data Management',
      description: 'MongoDB-powered storage with comprehensive report management',
      icon: <DataUsage sx={{ fontSize: 32, color: 'warning.main' }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      endpoints: ['CRUD Operations', 'User Tracking', 'Report History'],
      stats: 'Secure Storage',
      action: () => navigate('/reports')
    }
  ];

  const quickActions = [
    {
      title: 'Search Drugs',
      description: 'Analyze pharmaceutical products',
      icon: <Science />,
      color: 'primary',
      path: '/drug-search'
    },
    {
      title: 'Search Companies',
      description: 'Explore company portfolios',
      icon: <Business />,
      color: 'secondary',
      path: '/company-search'
    },
    {
      title: 'View Reports',
      description: 'Access generated reports',
      icon: <Assessment />,
      color: 'success',
      path: '/reports'
    },
    {
      title: 'API Docs',
      description: 'Technical documentation',
      icon: <Api />,
      color: 'info',
      path: '/api-info'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          🧬 Pharmaceutical Intelligence Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          Advanced AI-powered analysis for pharmaceutical research, market intelligence, and drug development insights
        </Typography>
      </Box>

      {/* Error Display */}
      {error && typeof error === 'string' && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={checkAPIStatus}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* API Status Card */}
      <Card sx={{ mb: 4, background: apiStatus.healthy ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: apiStatus.healthy ? 'success.main' : 'error.main',
                  width: 48,
                  height: 48
                }}
              >
                {apiStatus.loading ? (
                  <LinearProgress sx={{ width: 24, height: 24, borderRadius: 12 }} />
                ) : apiStatus.healthy ? (
                  <CheckCircle />
                ) : (
                  <Error />
                )}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  API Status: {apiStatus.loading ? 'Checking...' : (apiStatus.healthy ? 'Healthy' : 'Unavailable')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {apiStatus.healthy ? 'All systems operational' : 'Connection issues detected'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!apiStatus.loading && !apiStatus.healthy && (
                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />}
                  onClick={checkAPIStatus}
                  size="small"
                >
                  Retry
                </Button>
              )}
              <Chip 
                label={apiStatus.healthy ? 'Online' : 'Offline'} 
                color={apiStatus.healthy ? 'success' : 'error'}
                variant="filled"
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Core Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                }
              }} 
              onClick={feature.action}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      background: feature.gradient,
                      width: 56,
                      height: 56,
                      mr: 2
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Chip 
                      label={feature.stats} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                  {feature.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {feature.endpoints.map((endpoint, idx) => (
                    <Chip 
                      key={idx} 
                      label={endpoint} 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.7rem',
                        borderColor: feature.color,
                        color: feature.color
                      }} 
                    />
                  ))}
                </Box>
                
                <Button
                  variant="contained"
                  endIcon={<Launch />}
                  sx={{
                    background: feature.gradient,
                    '&:hover': {
                      background: feature.gradient,
                      opacity: 0.9
                    }
                  }}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item key={index}>
            <Button 
              variant="contained" 
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              size="large"
              color={action.color}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                }
              }}
            >
              {action.title}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* API Info Summary */}
      {apiInfo && typeof apiInfo === 'object' && (
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Version:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {typeof apiInfo.version === 'string' ? apiInfo.version : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Powered by:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {typeof apiInfo.powered_by === 'string' ? apiInfo.powered_by : 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Features:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {apiInfo.capabilities ? 'Available' : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Endpoints:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {apiInfo.endpoints && typeof apiInfo.endpoints === 'object' ? Object.keys(apiInfo.endpoints).length : 0} available
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
