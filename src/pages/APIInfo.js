import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Paper, Chip,
  Accordion, AccordionSummary, AccordionDetails, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, CircularProgress, Divider, Button
} from '@mui/material';
import {
  Api, ExpandMore, Science, Business, Assessment,
  TrendingUp, Build, Timeline, CheckCircle, Error, Refresh
} from '@mui/icons-material';
import { generalAPI } from '../services/api';

const APIInfo = () => {
  const [apiInfo, setApiInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAPIInfo();
  }, []);

  const loadAPIInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await generalAPI.info();
      setApiInfo(response.data?.data || response.data);
    } catch (err) {
      console.error('Load API info error:', err);
      setError(err.userMessage || 'Failed to load API information');
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    {
      category: 'Drug Search',
      icon: <Science />,
      color: 'primary',
      endpoints: [
        { method: 'POST', path: '/search/product', description: 'Main drug search (comprehensive, basic, detailed)' },
        { method: 'POST', path: '/search/product/market-analysis', description: 'Drug market intelligence' },
        { method: 'POST', path: '/search/product/formulation-analysis', description: 'Drug formulation analysis' },
        { method: 'POST', path: '/search/product/pharmacokinetic-analysis', description: 'Drug PK/PD analysis' },
        { method: 'GET', path: '/search/product/{report_id}', description: 'Retrieve drug report' },
        { method: 'GET', path: '/search/product/user/{user_id}', description: 'Get user drug reports' },
        { method: 'PUT', path: '/search/product/{report_id}', description: 'Update drug report' },
        { method: 'DELETE', path: '/search/product/{report_id}', description: 'Delete drug report' }
      ]
    },
    {
      category: 'Company Search',
      icon: <Business />,
      color: 'secondary',
      endpoints: [
        { method: 'POST', path: '/search/company', description: 'Main company search' },
        { method: 'POST', path: '/search/company/market-analysis', description: 'Company market intelligence' },
        { method: 'POST', path: '/search/company/formulation-analysis', description: 'Company formulation analysis' },
        { method: 'POST', path: '/search/company/pharmacokinetic-analysis', description: 'Company PK/PD analysis' },
        { method: 'GET', path: '/search/company/{report_id}', description: 'Retrieve company report' },
        { method: 'GET', path: '/search/company/by-name/{company_name}', description: 'Search by company name' },
        { method: 'GET', path: '/search/company/all', description: 'Get all company reports' },
        { method: 'GET', path: '/search/company/stats', description: 'Get company reports statistics' },
        { method: 'PUT', path: '/search/company/{report_id}', description: 'Update company report' },
        { method: 'DELETE', path: '/search/company/{report_id}', description: 'Delete company report' }
      ]
    },
    {
      category: 'General',
      icon: <Api />,
      color: 'default',
      endpoints: [
        { method: 'GET', path: '/health', description: 'API health check' },
        { method: 'GET', path: '/info', description: 'API information' }
      ]
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={loadAPIInfo}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📚 API Documentation
      </Typography>

      {/* API Overview */}
      {apiInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              API Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Version:</strong> {apiInfo.version || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Powered by:</strong> {apiInfo.powered_by || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Features:</strong> {apiInfo.capabilities ? 'Available' : 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Endpoints:</strong> {apiInfo.endpoints ? Object.keys(apiInfo.endpoints).length : 0}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Science sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Drug Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive analysis for complete drug intelligence
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Company Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pharmaceutical company portfolio and market analysis
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                AI-Powered
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPT-4o Search Preview + LangChain validation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Data Storage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MongoDB integration with full CRUD operations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Endpoints Documentation */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Available Endpoints
      </Typography>

      {endpoints.map((category, index) => (
        <Accordion key={index} defaultExpanded={index === 0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: `${category.color}.main` }}>
                {category.icon}
              </Box>
              <Typography variant="h6">
                {category.category}
              </Typography>
              <Chip 
                label={`${category.endpoints.length} endpoints`} 
                size="small" 
                color={category.color}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Method</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {category.endpoints.map((endpoint, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip 
                          label={endpoint.method} 
                          color={endpoint.method === 'GET' ? 'success' : 
                                 endpoint.method === 'POST' ? 'primary' :
                                 endpoint.method === 'PUT' ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {endpoint.path}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {endpoint.description}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Data Sources */}
      {apiInfo && apiInfo.data_sources && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Data Sources
            </Typography>
            <Grid container spacing={1}>
              {apiInfo.data_sources.map((source, index) => (
                <Grid item key={index}>
                  <Chip label={source} variant="outlined" />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Usage Examples */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Start Examples
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Drug Search Example</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  POST /search/product<br/>
                  {JSON.stringify({
                    product_name: "Lisinopril",
                    user_id: "demo_user",
                    analysis_type: "comprehensive"
                  }, null, 2)}
                </Typography>
              </Paper>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Company Search Example</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  POST /search/company<br/>
                  {JSON.stringify({
                    company_name: "Pfizer",
                    user_id: "demo_user"
                  }, null, 2)}
                </Typography>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};

export default APIInfo;
