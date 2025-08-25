import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Paper, Alert, CircularProgress, Chip, List, ListItem, ListItemText,
  ListItemIcon, Divider, IconButton, Snackbar, Link
} from '@mui/material';
import {
  Search, Link as LinkIcon, Article, Science, Business,
  OpenInNew, ContentCopy, Info, Source
} from '@mui/icons-material';
import { sourcesAPI } from '../services/api';

const Sources = () => {
  const [searchParams] = useSearchParams();
  const [reportId, setReportId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Debug: Monitor sources state changes
  useEffect(() => {
    console.log('🔄 Sources state changed:', sources);
  }, [sources]);

  // Check for reportId in URL parameters on component mount
  useEffect(() => {
    const urlReportId = searchParams.get('reportId');
    console.log('🔍 URL ReportId:', urlReportId);
    console.log('🔍 URL ReportId type:', typeof urlReportId);
    
    // Ensure we get a proper string value
    let cleanReportId = '';
    if (urlReportId) {
      if (typeof urlReportId === 'string') {
        cleanReportId = urlReportId;
      } else if (typeof urlReportId === 'object') {
        // If it's an object, try to extract the string value
        cleanReportId = urlReportId.toString ? urlReportId.toString() : JSON.stringify(urlReportId);
      } else {
        cleanReportId = String(urlReportId);
      }
    }
    
    console.log('🔍 Clean ReportId:', cleanReportId);
    
    if (cleanReportId && cleanReportId !== '[object Object]') {
      setReportId(cleanReportId);
      // Automatically search for sources
      setTimeout(() => {
        handleSearch(cleanReportId);
      }, 100);
    }
  }, [searchParams]);

  const handleSearch = async (id = null) => {
    // Debug: Log the actual values
    console.log('🔍 handleSearch called with id:', id);
    console.log('🔍 current reportId state:', reportId);
    
    // Get the search ID - use the parameter if provided, otherwise use the state
    let searchId = '';
    if (id !== null && id !== undefined) {
      searchId = String(id);
    } else {
      searchId = String(reportId || '');
    }
    
    console.log('🔍 Final searchId:', searchId);
    console.log('🔍 searchId.trim():', searchId.trim());
    console.log('🔍 searchId.length:', searchId.length);
    
    // Check for invalid searchId
    if (!searchId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid report ID', severity: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);
    setSources(null);

    try {
      console.log('🔍 Making API request for report ID:', searchId.trim());
      console.log('🔍 SearchId type:', typeof searchId);
      console.log('🔍 SearchId value:', searchId);
      console.log('🔍 Trimmed value:', searchId.trim());
      const response = await sourcesAPI.getSources(searchId.trim());
      console.log('✅ API Response received:', response);
      console.log('📊 Response data structure:', response.data);
      console.log('📋 Sources data:', response.data.data);
      
      setSources(response.data.data);
      setSnackbar({ open: true, message: `Found ${response.data.data.sources.length} sources`, severity: 'success' });
    } catch (err) {
      console.error('❌ Error fetching sources:', err);
      console.error('❌ Error details:', {
        message: err.message,
        userMessage: err.userMessage,
        response: err.response,
        status: err.response?.status
      });
      setError(err.userMessage || 'Failed to fetch sources');
      setSnackbar({ open: true, message: err.userMessage || 'Failed to fetch sources', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Copied to clipboard!', severity: 'success' });
    }
  };

  const getSourceIcon = (source) => {
    if (source.type === 'url') {
      return <LinkIcon color="primary" />;
    }
    
    // Check for specific source types
    const sourceName = source.name.toLowerCase();
    if (sourceName.includes('fda') || sourceName.includes('ema')) {
      return <Article color="success" />;
    } else if (sourceName.includes('pubmed') || sourceName.includes('clinicaltrials')) {
      return <Science color="info" />;
    } else if (sourceName.includes('pharmacircle') || sourceName.includes('researchandmarkets')) {
      return <Business color="warning" />;
    }
    
    return <Source color="action" />;
  };

  const getSourceColor = (source) => {
    const sourceName = source.name.toLowerCase();
    if (sourceName.includes('fda') || sourceName.includes('ema')) {
      return 'success';
    } else if (sourceName.includes('pubmed') || sourceName.includes('clinicaltrials')) {
      return 'info';
    } else if (sourceName.includes('pharmacircle') || sourceName.includes('researchandmarkets')) {
      return 'warning';
    }
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🔍 Report Sources
      </Typography>

      <Grid container spacing={3}>
        {/* Search Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Source Lookup
              </Typography>
              
                             <TextField
                 fullWidth
                 label="Report ID"
                 value={typeof reportId === 'string' ? reportId : ''}
                 onChange={(e) => setReportId(String(e.target.value))}
                 placeholder="Enter report ID (e.g., REPORT_demo_user_ASPIRIN_...)"
                 sx={{ mb: 2 }}
                 helperText="Enter the complete report ID to view sources"
               />

                                                           <Button
                  fullWidth
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                  onClick={() => handleSearch(reportId)}
                  disabled={loading || !reportId.trim()}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Searching...' : 'Find Sources'}
                </Button>
               
                               

              <Typography variant="body2" color="text.secondary">
                This feature extracts and displays all sources (URLs, citations, references) used to generate a specific report.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sources Found
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : sources ? (
                <Box>
                  {/* Report Info */}
                  <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#2563eb', fontWeight: 'bold' }}>
                      {sources.report_name}: {sources.report_type.charAt(0).toUpperCase() + sources.report_type.slice(1)} Report
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Report ID:</strong> {sources.report_id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sources Found:</strong> {sources.sources.length}
                    </Typography>
                  </Paper>

                  {/* Sources List */}
                  {sources.sources.length > 0 ? (
                    <List>
                      {sources.sources.map((source, index) => (
                        <React.Fragment key={index}>
                          <ListItem
                            sx={{
                              border: '1px solid rgba(0,0,0,0.1)',
                              borderRadius: 1,
                              mb: 1,
                              backgroundColor: 'white',
                              '&:hover': {
                                backgroundColor: '#f8f9fa',
                                boxShadow: 1
                              }
                            }}
                          >
                            <ListItemIcon>
                              {getSourceIcon(source)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {source.name}
                                  </Typography>
                                  <Chip 
                                    label={source.type} 
                                    size="small" 
                                    color={getSourceColor(source)}
                                    variant="outlined"
                                  />
                                  {source.year !== 'Unknown' && (
                                    <Chip 
                                      label={source.year} 
                                      size="small" 
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  {source.url && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                      <Link 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        sx={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: 0.5,
                                          color: '#2563eb',
                                          textDecoration: 'none',
                                          '&:hover': {
                                            textDecoration: 'underline'
                                          }
                                        }}
                                      >
                                        {source.url}
                                        <OpenInNew sx={{ fontSize: 16 }} />
                                      </Link>
                                      <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(source.url)}
                                        sx={{ ml: 1 }}
                                      >
                                        <ContentCopy sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Box>
                                  )}
                                  <Typography variant="body2" color="text.secondary">
                                    {source.type === 'citation' ? 'Citation from report content' : 'Direct URL reference'}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < sources.sources.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Sources Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No sources were found in this report. This might be because:
                      </Typography>
                      <Box component="ul" sx={{ textAlign: 'left', mt: 1 }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                          The report doesn't contain explicit source citations
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          Sources are embedded in the content without clear formatting
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                          The report was generated without source tracking
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Enter a Report ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a report ID to view the sources used to generate that report.
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default Sources;
