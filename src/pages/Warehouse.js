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
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent
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
   BugReport,
   Storage,
   Assessment,
   Webhook,
   Business
 } from '@mui/icons-material';

import { warehouseAPI } from '../services/api';
import { debugTableData, logDebug, isDebugEnabled, setDebugEnabled } from '../utils/debugUtils';
import { convertMarkdownToStructuredData, analyzeMarkdownContent, debugTableParsing } from '../utils/markdownParser';

const Warehouse = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    query: '',
    entity_type: 'drug',
    user_id: 'demo_user',
    extraction_cycles: 5,
    model: 'gpt-4o-search-preview'
  });
  const [warehouseId, setWarehouseId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [debugInfo, setDebugInfo] = useState(null);

  const entityTypes = [
    { value: 'drug', label: 'Drug', icon: <Science />, color: 'primary' },
    { value: 'company', label: 'Company', icon: <Business />, color: 'secondary' }
  ];

  const reportSections = [
    'market_analysis',
    'formulation_analysis', 
    'pharmacokinetic_analysis',
    'dosage_and_opportunity_matrix',
    'drug_search'
  ];

  const steps = [
    {
      label: 'Extract Raw Data',
      description: 'Gather comprehensive raw data from multiple sources',
      icon: <Storage />
    },
    {
      label: 'Generate Report',
      description: 'Create structured report using AI agents',
      icon: <Assessment />
    },
    {
      label: 'Webhook Processing',
      description: 'Process data through external webhook API',
      icon: <Webhook />
    }
  ];

  // Stage 1: Extract raw data to warehouse
  const handleExtractRawData = async () => {
    if (!formData.query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    if (!formData.user_id.trim()) {
      setError('Please enter a valid User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      console.log('Starting raw data extraction with data:', formData);
      
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

      const response = await warehouseAPI.extractRawData(formData);
      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('Raw data extraction response:', response);
      
      if (response.data && response.data.success) {
        const warehouseId = response.data.data.warehouse_id;
        setWarehouseId(warehouseId);
        setActiveStep(1);
        
        setSnackbar({
          open: true,
          message: `Raw data extraction completed! Warehouse ID: ${warehouseId}`,
          severity: 'success'
        });
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Raw data extraction error:', err);
      setError(err.userMessage || err.response?.data?.detail || 'Failed to extract raw data');
      setSnackbar({
        open: true,
        message: `Extraction failed: ${err.userMessage || err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  // Stage 2: Generate report from warehouse
  const handleGenerateReport = async () => {
    if (!warehouseId) {
      setError('Please extract raw data first to get warehouse ID');
      return;
    }
    
    if (!formData.user_id.trim()) {
      setError('Please enter a valid User ID');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      console.log('Starting report generation from warehouse:', warehouseId);
      
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

      const response = await warehouseAPI.generateReportFromWarehouse({
        warehouse_id: warehouseId,
        user_id: formData.user_id,
        report_sections: reportSections,
        agent_cycles_per_section: 3
      });
      
      clearInterval(progressInterval);
      setLoadingProgress(100);

      console.log('Report generation response:', response);
      
      if (response.data && response.data.success) {
        const reportData = response.data.data;
        setReportData(reportData);
        setActiveStep(2);
        
        // Check webhook status
        let successMessage = `Report generation completed! ${reportData.section_reports ? Object.keys(reportData.section_reports).length : 0} sections processed.`;
        if (reportData.webhook_result?.success) {
          successMessage += ' Webhook processed successfully.';
        } else if (reportData.webhook_result) {
          successMessage += ' Webhook processing failed, using fallback parsing.';
        }
        
        setSnackbar({
          open: true,
          message: successMessage,
          severity: 'success'
        });
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.userMessage || err.response?.data?.detail || 'Failed to generate report');
      setSnackbar({
        open: true,
        message: `Report generation failed: ${err.userMessage || err.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setWarehouseId('');
    setReportData(null);
    setError(null);
    setFormData({
      query: '',
      entity_type: 'drug',
      user_id: 'demo_user',
      extraction_cycles: 5,
      model: 'gpt-4o-search-preview'
    });
  };

  const renderWebhookData = () => {
    if (!reportData?.webhook_result) return null;

    const webhookResult = reportData.webhook_result;
    const structuredData = reportData.structured_data;

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Webhook color={webhookResult.success ? 'success' : 'error'} />
            Webhook Processing Results
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={webhookResult.success ? 'Webhook Successful' : 'Webhook Failed'} 
              color={webhookResult.success ? 'success' : 'error'}
              sx={{ mr: 1 }}
            />
            {webhookResult.status_code && (
              <Chip label={`Status: ${webhookResult.status_code}`} variant="outlined" />
            )}
          </Box>

          {webhookResult.success && structuredData && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Structured Data:</Typography>
              
              {structuredData.extracted_tables && structuredData.extracted_tables.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Extracted Tables ({structuredData.extracted_tables.length})
                  </Typography>
                  {structuredData.extracted_tables.map((table, index) => (
                    <Accordion key={index} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>Table {index + 1} - {table.section}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {table.table_data[0]?.split('|').map((header, i) => (
                                  <TableCell key={i}>{header.trim()}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {table.table_data.slice(1).map((row, i) => (
                                <TableRow key={i}>
                                  {row.split('|').map((cell, j) => (
                                    <TableCell key={j}>{cell.trim()}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}

              {structuredData.key_value_pairs && Object.keys(structuredData.key_value_pairs).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Key-Value Pairs ({Object.keys(structuredData.key_value_pairs).length})
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(structuredData.key_value_pairs).map(([key, value]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        <Paper sx={{ p: 1, backgroundColor: 'grey.50' }}>
                          <Typography variant="caption" color="textSecondary">{key}</Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {structuredData.sections && Object.keys(structuredData.sections).length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Content Sections ({Object.keys(structuredData.sections).length})
                  </Typography>
                  {Object.entries(structuredData.sections).map(([section, content]) => (
                    <Accordion key={section} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{section.replace(/_/g, ' ').toUpperCase()}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {Array.isArray(content) ? content.join('\n') : content}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {!webhookResult.success && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Webhook Error:</Typography>
              <Typography variant="body2">{webhookResult.error}</Typography>
              {webhookResult.response_text && (
                <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  Response: {webhookResult.response_text}
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Storage color="primary" />
        Data Warehouse & Report Generation
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Two-stage process: First extract raw data to warehouse, then generate comprehensive reports using AI agents with webhook integration.
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel 
              StepIconComponent={() => step.icon}
              optional={index === 2 ? (
                <Typography variant="caption" color="textSecondary">
                  {reportData?.webhook_result?.success ? 'Completed' : 'Pending'}
                </Typography>
              ) : undefined}
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Configuration</Typography>
              
              <TextField
                fullWidth
                label="Search Query"
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                placeholder="Enter drug name or company name"
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                label="Entity Type"
                value={formData.entity_type}
                onChange={(e) => setFormData({ ...formData, entity_type: e.target.value })}
                sx={{ mb: 2 }}
              >
                {entityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </TextField>

                             <TextField
                 fullWidth
                 label="User ID"
                 value={formData.user_id}
                 onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                 helperText="Required for webhook API research record lookup"
                 sx={{ mb: 2 }}
               />

              <TextField
                fullWidth
                label="Extraction Cycles"
                type="number"
                value={formData.extraction_cycles}
                onChange={(e) => setFormData({ ...formData, extraction_cycles: parseInt(e.target.value) })}
                inputProps={{ min: 3, max: 10 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleExtractRawData}
                  disabled={loading || !formData.query.trim()}
                  startIcon={<Storage />}
                >
                  Extract Raw Data
                </Button>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleGenerateReport}
                  disabled={loading || !warehouseId}
                  startIcon={<Assessment />}
                >
                  Generate Report
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={loading}
                  startIcon={<Refresh />}
                >
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Results</Typography>
              
              {loading && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress variant="determinate" value={loadingProgress} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Processing... {loadingProgress}%
                  </Typography>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {warehouseId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Warehouse ID:</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {warehouseId}
                  </Typography>
                </Alert>
              )}

              {reportData && (
                <Box>
                  <Typography variant="h6" gutterBottom>Generated Report</Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Report Details:</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Report ID:</strong> {reportData.report_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Entity Type:</strong> {reportData.entity_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Sections:</strong> {reportData.report_sections ? Object.keys(reportData.report_sections).length : 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Agent Cycles:</strong> {reportData.agent_cycles?.length || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Webhook Results */}
                  {renderWebhookData()}

                  {/* Final Report Content */}
                  {reportData.final_report && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1">Final Report Content</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {reportData.final_report}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Warehouse;
