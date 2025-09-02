import React, { useState } from 'react';
import {
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Tabs, 
  Tab, 
  Paper, 
  Alert, 
  CircularProgress, 
  Chip, 
  Accordion,
  AccordionSummary, 
  AccordionDetails, 
  Divider, 
  Snackbar,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import ClickableTableCell from '../components/ClickableTableCell';
import SourceSummary from '../components/SourceSummary';
import {
  Science, 
  Search, 
  ExpandMore, 
  ContentCopy, 
  Download, 
  Refresh,
  AutoAwesome,
  Analytics,
  CheckCircle,
  Error,
  Info,
  BugReport
} from '@mui/icons-material';

import { drugAPI, generalAPI } from '../services/api';
import { debugTableData, logDebug, isDebugEnabled, setDebugEnabled } from '../utils/debugUtils';
import { convertMarkdownToStructuredData, analyzeMarkdownContent, debugTableParsing } from '../utils/markdownParser';

const DrugSearch = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    product_name: '',
    user_id: 'demo_user',
    product_type: 'comprehensive'
  });
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [debugInfo, setDebugInfo] = useState(null);

  const analysisTypes = [
    { 
      value: 'comprehensive', 
      label: 'Comprehensive', 
      icon: <Science />, 
      color: 'primary',
      description: 'Complete drug analysis including all aspects',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
    }
  ];

  // Test API connection
  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      const healthResponse = await generalAPI.health();
      console.log('Health check response:', healthResponse);
      
      const infoResponse = await generalAPI.info();
      console.log('Info response:', infoResponse);
      
      setSnackbar({ 
        open: true, 
        message: 'API connection successful!', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('API connection test failed:', err);
      setSnackbar({ 
        open: true, 
        message: `API connection failed: ${err.message}`, 
        severity: 'error' 
      });
    }
  };

  // Debug table data
  const debugTableDataHandler = () => {
    if (result && result.tables) {
      const debugResults = result.tables.map((table, index) => ({
        tableIndex: index,
        tableTitle: table.title,
        debugInfo: debugTableData(table.rows)
      }));
      
      setDebugInfo(debugResults);
      logDebug('Table Data Analysis', debugResults, true);
      
      // Also analyze the raw markdown content if available
      if (result.report) {
        const markdownAnalysis = analyzeMarkdownContent(result.report);
        console.log('Markdown Content Analysis:', markdownAnalysis);
      }
      
      setSnackbar({
        open: true,
        message: `Table data analysis completed. Found ${result.tables.length} tables with ${result.tables.reduce((total, table) => total + table.rows.length, 0)} rows.`,
        severity: 'info'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No table data available for debugging',
        severity: 'warning'
      });
    }
  };

  // Debug table parsing
  const debugTableParsingHandler = () => {
    if (result && result.report) {
      const parsingDebug = debugTableParsing(result.report);
      setDebugInfo(parsingDebug);
      console.log('Table Parsing Debug:', parsingDebug);
      
      setSnackbar({
        open: true,
        message: `Table parsing debug completed. Found ${parsingDebug.potentialTableRows.length} potential table rows.`,
        severity: 'info'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'No report content available for parsing debug',
        severity: 'warning'
      });
    }
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    const currentDebugState = isDebugEnabled();
    setDebugEnabled(!currentDebugState);
    
    setSnackbar({
      open: true,
      message: `Debug mode ${!currentDebugState ? 'enabled' : 'disabled'}`,
      severity: 'info'
    });
  };

  const handleSearch = async () => {
    if (!formData.product_name.trim()) {
      setError('Please enter a drug name');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setDebugInfo(null);
    setLoadingProgress(0);

    try {
      console.log('Starting drug search with data:', formData);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await drugAPI.search(formData);
      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('Drug search response:', response);
      console.log('Response data structure:', {
        hasSuccess: !!response.data?.success,
        hasTables: !!response.data?.tables,
        hasReport: !!response.data?.report,
        hasData: !!response.data?.data,
        hasProductInfo: !!response.data?.data?.product_information,
        tablesCount: response.data?.tables?.length || 0,
        reportType: typeof response.data?.report,
        fullData: response.data
      });
      
      if (response.data && response.data.success) {
        let processedData = response.data;
        
        // Handle the actual backend response structure
        if (response.data.data && response.data.data.product_information) {
          console.log('Found product_information, converting to structured format...');
          const markdownContent = response.data.data.product_information;
          
          console.log('Markdown content length:', markdownContent.length);
          console.log('Markdown content preview (first 1000 chars):', markdownContent.substring(0, 1000));
          console.log('Markdown content preview (last 500 chars):', markdownContent.substring(markdownContent.length - 500));
          
          // Convert the markdown content to structured tables
          processedData = convertMarkdownToStructuredData(markdownContent);
          
          // Add the original response data for reference
          processedData.originalData = response.data.data;
          processedData.report_id = response.data.data.report_id;
          processedData.search_query = response.data.data.search_query;
          processedData.timestamp = response.data.data.timestamp;
          
          console.log('Converted data:', processedData);
          console.log('Tables found:', processedData.tables?.length || 0);
          if (processedData.tables) {
            processedData.tables.forEach((table, index) => {
              console.log(`Table ${index + 1}: "${table.title}" - ${table.rows.length} rows`);
            });
          }
          
          // If no tables were parsed, create a fallback table with the raw content
          if (!processedData.tables || processedData.tables.length === 0) {
            console.log('No tables parsed, creating fallback table...');
            processedData.tables = [{
              title: 'Raw Analysis Content',
              headers: ['Content'],
              rows: [[markdownContent]]
            }];
            processedData.hasTables = true;
            processedData.tableCount = 1;
            console.log('Created fallback table with raw content');
          }
        }
        // If we have raw markdown content but no tables, try to parse it
        else if (response.data.report && (!response.data.tables || response.data.tables.length === 0)) {
          console.log('Converting markdown content to structured tables...');
          processedData = convertMarkdownToStructuredData(response.data.report);
          console.log('Converted data:', processedData);
          
          // If no tables were parsed, create a fallback table with the raw content
          if (!processedData.tables || processedData.tables.length === 0) {
            console.log('No tables parsed from report, creating fallback table...');
            processedData.tables = [{
              title: 'Raw Analysis Content',
              headers: ['Content'],
              rows: [[response.data.report]]
            }];
            processedData.hasTables = true;
            processedData.tableCount = 1;
            console.log('Created fallback table with raw report content');
          }
        }
        
        setResult(processedData);
        
        // Debug table data if debug mode is enabled
        if (isDebugEnabled() && processedData.tables) {
          setTimeout(() => {
            debugTableDataHandler();
          }, 1000);
        }
        
        // Analyze markdown content for debugging
        if (processedData.report) {
          const analysis = analyzeMarkdownContent(processedData.report);
          console.log('Markdown content analysis:', analysis);
        }
        
        setSnackbar({
          open: true,
          message: `Drug analysis completed successfully! ${processedData.tables?.length || 0} tables found.`,
          severity: 'success'
        });
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Drug search error:', err);
      setError(err.userMessage || err.response?.data?.detail || 'Failed to search for drug information');
      setSnackbar({
        open: true,
        message: `Search failed: ${err.userMessage || err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getReportContent = () => {
    if (!result) return '';
    
    // Handle the new structure where content is in originalData.product_information
    if (result.originalData && result.originalData.product_information) {
      return result.originalData.product_information;
    }
    
    // Handle the old structure
    if (result.report) {
      return typeof result.report === 'string' ? result.report : JSON.stringify(result.report, null, 2);
    }
    
    return '';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({
      open: true,
      message: 'Content copied to clipboard!',
      severity: 'success'
    });
  };

  const downloadReport = () => {
    if (!result) return;
    
    const content = getReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.product_name}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSnackbar({
      open: true,
      message: 'Report downloaded successfully!',
      severity: 'success'
    });
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          💊 Drug Search & Analysis
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          Advanced AI-powered pharmaceutical drug analysis with comprehensive insights and market intelligence
        </Typography>
        <Alert severity="info" sx={{ mb: 3, maxWidth: 600 }}>
          <Typography variant="body2">
            <strong>Note:</strong> AI analysis may take 30-90 seconds to complete. Please be patient during processing.
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Search Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    mr: 2
                  }}
                >
                  <Search />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Search Parameters
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Drug Name"
                value={formData.product_name}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="e.g., Aspirin, Ibuprofen, Paracetamol"
                sx={{ mb: 2 }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="User ID"
                value={formData.user_id}
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                placeholder="Enter user ID"
                sx={{ mb: 3 }}
                variant="outlined"
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                onClick={handleSearch}
                disabled={loading}
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  }
                }}
              >
                {loading ? `Searching... ${Math.round(loadingProgress)}%` : 'Search Drug'}
              </Button>
              
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        borderRadius: 3
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    AI analysis in progress... This may take up to 2 minutes
                  </Typography>
                </Box>
              )}

              {/* Test API Connection Button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={testAPIConnection}
                size="small"
                sx={{ mt: 2 }}
              >
                Test API Connection
              </Button>

              {/* Debug Controls */}
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleDebugMode}
                  startIcon={<BugReport />}
                  color={isDebugEnabled() ? 'success' : 'default'}
                >
                  {isDebugEnabled() ? 'Debug ON' : 'Debug OFF'}
                </Button>
                {result && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={debugTableDataHandler}
                    startIcon={<BugReport />}
                  >
                    Debug Tables
                  </Button>
                )}
                {result && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={debugTableParsingHandler}
                    startIcon={<BugReport />}
                  >
                    Debug Parsing
                  </Button>
                )}
                {result && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      console.log('=== FULL RESULT DATA ===');
                      console.log('Result object:', result);
                      console.log('Result type:', typeof result);
                      console.log('Has tables:', !!result.tables);
                      console.log('Tables count:', result.tables?.length || 0);
                      console.log('Has report:', !!result.report);
                      console.log('Report type:', typeof result.report);
                      if (result.report) {
                        console.log('Report preview (first 500 chars):', result.report.substring(0, 500));
                      }
                      setSnackbar({
                        open: true,
                        message: 'Result data logged to console',
                        severity: 'info'
                      });
                    }}
                    startIcon={<Info />}
                  >
                    Log Result Data
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Types */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                    mr: 2
                  }}
                >
                  <Analytics />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Analysis Types
                </Typography>
              </Box>
              
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    mx: 0.5,
                    '&.Mui-selected': {
                      background: analysisTypes[activeTab].gradient,
                      color: 'white',
                      '&:hover': {
                        background: analysisTypes[activeTab].gradient,
                        opacity: 0.9
                      }
                    }
                  }
                }}
              >
                {analysisTypes.map((type, index) => (
                  <Tab
                    key={type.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    }
                  />
                ))}
              </Tabs>

              <Box sx={{ mt: 3 }}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AutoAwesome sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {analysisTypes[activeTab].label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {analysisTypes[activeTab].description}
                  </Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>

                      {/* Results */}
        <Grid item xs={12}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }} 
              onClose={() => setError(null)}
              action={
                <Button color="inherit" size="small" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {result && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        mr: 2
                      }}
                    >
                      <CheckCircle />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Analysis Results
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        onClick={() => copyToClipboard(getReportContent())}
                        sx={{ 
                          background: 'rgba(37, 99, 235, 0.1)',
                          '&:hover': { background: 'rgba(37, 99, 235, 0.2)' }
                        }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download report">
                      <IconButton
                        onClick={downloadReport}
                        sx={{ 
                          background: 'rgba(16, 185, 129, 0.1)',
                          '&:hover': { background: 'rgba(16, 185, 129, 0.2)' }
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh analysis">
                      <IconButton
                        onClick={handleSearch}
                        sx={{ 
                          background: 'rgba(124, 58, 237, 0.1)',
                          '&:hover': { background: 'rgba(124, 58, 237, 0.2)' }
                        }}
                      >
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Report ID:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {result.report_id || 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Drug:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formData.product_name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Processing Time:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {result.processing_time ? `${result.processing_time.toFixed(2)}s` : 'N/A'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Analysis Type:</Typography>
                          <Chip 
                            label={analysisTypes[activeTab].label} 
                            color={analysisTypes[activeTab].color}
                            size="small"
                            variant="filled"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Success:</Typography>
                          <Chip 
                            label={result.success ? 'Yes' : 'No'} 
                            color={result.success ? 'success' : 'error'}
                            size="small"
                            variant="filled"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Debug Information */}
                {debugInfo && (
                  <Accordion defaultExpanded sx={{ mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BugReport sx={{ mr: 1, color: 'warning.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Debug Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, maxHeight: 400, overflow: 'auto' }}>
                        <pre style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
                          {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Raw Content Debug - Show when tables fail to parse */}
                {result && (!result.tables || result.tables.length === 0) && (
                  <Accordion defaultExpanded sx={{ mb: 3 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1, color: 'error.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Raw Content (Tables Failed to Parse)
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper sx={{ 
                        p: 3, 
                        background: '#fafafa', 
                        maxHeight: 500, 
                        overflow: 'auto',
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: 2
                      }}>
                        <pre style={{ 
                          whiteSpace: 'pre-wrap', 
                          fontFamily: '"Inter", monospace',
                          fontSize: '14px',
                          margin: 0,
                          lineHeight: 1.6,
                          color: '#374151'
                        }}>
                          {getReportContent()}
                        </pre>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Analysis Content */}
                {(() => {
                  if (result.tables && result.tables.length > 0) {
                    return result.tables.map((table, tableIndex) => (
                      <Card key={tableIndex} sx={{ mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                mr: 2,
                                width: 32,
                                height: 32
                              }}
                            >
                              <Analytics sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {table.title}
                            </Typography>
                          </Box>
                          
                          <TableContainer 
                            component={Paper} 
                            sx={{ 
                              maxHeight: 600,
                              overflow: 'auto',
                              border: '1px solid rgba(0,0,0,0.05)',
                              borderRadius: 2,
                              '& .MuiTable-root': {
                                minWidth: 650,
                                tableLayout: 'auto'
                              },
                              '& .MuiTableCell-root': {
                                maxWidth: 'none',
                                wordBreak: 'break-word'
                              }
                            }}
                          >
                            <Table stickyHeader size="small">
                              <TableHead>
                                <TableRow>
                                  {table.headers.map((header, headerIndex) => (
                                    <ClickableTableCell 
                                      key={headerIndex}
                                      cellContent={header}
                                      isHeader={true}
                                    />
                                  ))}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {table.rows.map((row, rowIndex) => (
                                  <TableRow 
                                    key={rowIndex}
                                    sx={{ 
                                      '&:nth-of-type(odd)': { 
                                        backgroundColor: 'rgba(0,0,0,0.02)' 
                                      },
                                      '&:hover': { 
                                        backgroundColor: 'rgba(37, 99, 235, 0.05)' 
                                      }
                                    }}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <ClickableTableCell 
                                        key={cellIndex}
                                        cellContent={cell}
                                      />
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                          
                          {/* Source Summary */}
                          <SourceSummary 
                            tableRows={table.rows}
                            tableTitle={table.title}
                          />
                        </CardContent>
                      </Card>
                    ));
                  }
                  
                  // Fallback to raw text if no tables found
                  return (
                    <Accordion defaultExpanded sx={{ 
                      '& .MuiAccordionSummary-root': {
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: 1
                      }
                    }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Info sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Analysis Content
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Paper sx={{ 
                          p: 3, 
                          background: '#fafafa', 
                          maxHeight: 500, 
                          overflow: 'auto',
                          border: '1px solid rgba(0,0,0,0.05)',
                          borderRadius: 2
                        }}>
                          <pre style={{ 
                            whiteSpace: 'pre-wrap', 
                            fontFamily: '"Inter", monospace',
                            fontSize: '14px',
                            margin: 0,
                            lineHeight: 1.6,
                            color: '#374151'
                          }}>
                            {getReportContent()}
                          </pre>
                        </Paper>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DrugSearch;
