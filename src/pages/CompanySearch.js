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
  Snackbar,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Business, 
  Search, 
  ExpandMore, 
  ContentCopy, 
  Refresh,
  AutoAwesome,
  Analytics,
  CheckCircle,
  Info,
  Download
} from '@mui/icons-material';
import { companyAPI, generalAPI } from '../services/api';

const CompanySearch = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    company_name: '',
    user_id: 'demo_user'
  });
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const analysisTypes = [
    { 
      value: 'comprehensive', 
      label: 'Comprehensive', 
      icon: <Business />, 
      color: 'primary',
      description: 'Complete company portfolio and drug analysis',
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

  const handleSearch = async () => {
    if (!formData.company_name.trim()) {
      setError('Please enter a company name');
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    setError(null);
    setResult(null);

    // Simulate progress for long-running requests
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 2000);

    try {
      let response;
      const searchData = {
        company_name: formData.company_name,
        user_id: formData.user_id
      };

      console.log('Sending company search request with data:', searchData);

      // Always use comprehensive analysis
      response = await companyAPI.search(searchData);

      console.log('API Response:', response);
      setLoadingProgress(100);
      setResult(response.data);
    } catch (err) {
      console.error('Search error:', err);
      console.error('Error details:', {
        message: err.message,
        userMessage: err.userMessage,
        response: err.response,
        request: err.request
      });
      
      // Handle timeout specifically
      if (err.message.includes('timeout')) {
        setError('Request timed out. The AI analysis is taking longer than expected. Please try again.');
      } else {
        setError(err.userMessage || err.response?.data?.detail || 'An error occurred during the search');
      }
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Content copied to clipboard!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'No content to copy', severity: 'warning' });
    }
  };

  const downloadReport = async () => {
    if (!result?.data) {
      setSnackbar({ open: true, message: 'No report to download', severity: 'warning' });
      return;
    }

    try {
      // Import required libraries
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Generate PDF content with parsed tables
      const generatePDFContent = () => {
        const tables = parseAIResponse(getReportContent());
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${formData.company_name} - ${analysisTypes[activeTab].label} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
              .header h1 { color: #7c3aed; margin: 0; font-size: 24px; }
              .header h2 { color: #666; margin: 10px 0 0 0; font-size: 16px; font-weight: normal; }
              .info-section { margin-bottom: 30px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
              .info-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #7c3aed; }
              .info-card h3 { margin: 0 0 10px 0; color: #7c3aed; font-size: 14px; }
              .info-card p { margin: 0; font-size: 12px; }
              .table-section { margin-bottom: 40px; }
              .table-title { color: #7c3aed; font-size: 18px; margin-bottom: 15px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
              th { background: #7c3aed; color: white; padding: 8px; text-align: left; font-weight: bold; }
              td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background: #f9f9f9; }
              .page-break { page-break-before: always; }
              @media print {
                body { margin: 15px; }
                .page-break { page-break-before: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏢 Company Intelligence Report</h1>
              <h2>${formData.company_name} - ${analysisTypes[activeTab].label} Analysis</h2>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <div class="info-section">
              <div class="info-grid">
                <div class="info-card">
                  <h3>Report Information</h3>
                  <p><strong>Company Name:</strong> ${formData.company_name}</p>
                  <p><strong>Analysis Type:</strong> ${analysisTypes[activeTab].label}</p>
                  <p><strong>Report ID:</strong> ${getReportId()}</p>
                </div>
                <div class="info-card">
                  <h3>Processing Details</h3>
                  <p><strong>Model Used:</strong> ${getModelUsed()}</p>
                  <p><strong>Processing Time:</strong> ${getProcessingTime()}</p>
                  <p><strong>Success:</strong> ${result.success ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
        `;

        if (tables.length > 0) {
          tables.forEach((table, index) => {
            htmlContent += `
              <div class="table-section ${index > 0 ? 'page-break' : ''}">
                <h2 class="table-title">${table.title}</h2>
                <table>
                  <thead>
                    <tr>
                      ${table.headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${table.rows.map(row => `
                      <tr>
                        ${row.map(cell => `<td>${cell}</td>`).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          });
        } else {
          // Fallback to raw content if no tables found
          htmlContent += `
            <div class="table-section">
              <h2 class="table-title">Analysis Content</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; font-size: 11px;">
                ${getReportContent().replace(/\n/g, '<br>')}
              </div>
            </div>
          `;
        }

        htmlContent += `
          </body>
          </html>
        `;

        return htmlContent;
      };

      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '600px';
      document.body.appendChild(iframe);

      const htmlContent = generatePDFContent();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use html2canvas to capture the iframe
      const canvas = await html2canvas(iframe.contentDocument.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: iframe.contentDocument.body.scrollHeight
      });

      // Generate PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${formData.company_name}_${analysisTypes[activeTab].label}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(iframe);
      
      setSnackbar({ open: true, message: 'PDF report downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      setSnackbar({ open: true, message: 'Failed to generate PDF. Please try again.', severity: 'error' });
    }
  };

  const getReportContent = () => {
    if (!result?.data) return '';
    
    return result.data.report_content || 
           result.data.company_information || 
           result.data.content || 
           JSON.stringify(result.data, null, 2);
  };

  // Clean markdown formatting from text
  const cleanMarkdown = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    return text
      // Remove bold formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic formatting
      .replace(/\*(.*?)\*/g, '$1')
      // Remove code formatting
      .replace(/`(.*?)`/g, '$1')
      // Remove strikethrough
      .replace(/~~(.*?)~~/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove image syntax
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Parse AI response and extract tables
  const parseAIResponse = (content) => {
    if (!content || typeof content !== 'string') return [];
    
    console.log('=== PARSING DEBUG START ===');
    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 500));
    
    // Try multiple parsing strategies
    let tables = [];
    
    // Strategy 1: Standard markdown table parsing
    tables = parseStandardTables(content);
    if (tables.length > 0) {
      console.log('Strategy 1 (Standard) found tables:', tables.length);
      return tables;
    }
    
    // Strategy 2: Alternative table parsing
    tables = parseTablesAlternative(content);
    if (tables.length > 0) {
      console.log('Strategy 2 (Alternative) found tables:', tables.length);
      return tables;
    }
    
    // Strategy 3: Aggressive table detection
    tables = parseAggressiveTables(content);
    if (tables.length > 0) {
      console.log('Strategy 3 (Aggressive) found tables:', tables.length);
      return tables;
    }
    
    console.log('No tables found with any parsing strategy');
    return [];
  };

  // Strategy 1: Standard markdown table parsing
  const parseStandardTables = (content) => {
    const tables = [];
    const lines = content.split('\n');
    let currentTable = null;
    let currentHeaders = [];
    let currentRows = [];
    let inTable = false;
    let consecutiveEmptyLines = 0;
    
    console.log('Parsing standard tables with', lines.length, 'lines');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line contains table headers (has | characters)
      if (line.includes('|') && line.includes('---')) {
        console.log(`Found table separator at line ${i}:`, line);
        // This is a table header separator, get the actual headers from previous line
        if (i > 0) {
          const headerLine = lines[i - 1].trim();
          if (headerLine.includes('|')) {
            currentHeaders = headerLine.split('|').map(h => cleanMarkdown(h.trim())).filter(h => h);
            console.log('Found headers:', currentHeaders);
            if (currentHeaders.length > 0) {
              currentTable = {
                title: cleanMarkdown(getTableTitle(lines, i)),
                headers: currentHeaders,
                rows: []
              };
              currentRows = [];
              inTable = true;
              consecutiveEmptyLines = 0;
              console.log('Started new table with title:', currentTable.title);
            }
          }
        }
      } else if (line.includes('|') && currentHeaders.length > 0 && inTable) {
        // This is a table row
        const cells = line.split('|').map(cell => cleanMarkdown(cell.trim())).filter(cell => cell);
        if (cells.length === currentHeaders.length) {
          currentRows.push(cells);
          consecutiveEmptyLines = 0;
          console.log('Added row to table:', cells);
        } else {
          console.log('Row skipped - column count mismatch:', cells.length, 'vs', currentHeaders.length);
          // Try to fix malformed rows by padding with empty cells
          if (cells.length < currentHeaders.length) {
            const paddedCells = [...cells];
            while (paddedCells.length < currentHeaders.length) {
              paddedCells.push('');
            }
            currentRows.push(paddedCells);
            consecutiveEmptyLines = 0;
            console.log('Fixed malformed row by padding:', paddedCells);
          } else if (cells.length > currentHeaders.length) {
            // Truncate extra columns
            const truncatedCells = cells.slice(0, currentHeaders.length);
            currentRows.push(truncatedCells);
            consecutiveEmptyLines = 0;
            console.log('Fixed malformed row by truncating:', truncatedCells);
          } else {
            // If column count doesn't match and we can't fix it, this might be the end of the table
            if (currentTable && currentRows.length > 0) {
              currentTable.rows = currentRows;
              tables.push(currentTable);
              console.log('Completed table with', currentRows.length, 'rows');
              currentTable = null;
              currentHeaders = [];
              currentRows = [];
              inTable = false;
              consecutiveEmptyLines = 0;
            }
          }
        }
      } else if (line === '') {
        // Empty line
        consecutiveEmptyLines++;
        if (currentTable && currentRows.length > 0 && consecutiveEmptyLines >= 2) {
          // End table after 2 consecutive empty lines
          currentTable.rows = currentRows;
          tables.push(currentTable);
          console.log('Completed table with', currentRows.length, 'rows (after empty lines)');
          currentTable = null;
          currentHeaders = [];
          currentRows = [];
          inTable = false;
          consecutiveEmptyLines = 0;
        }
      } else if (currentTable && currentRows.length > 0 && !line.includes('|') && line !== '') {
        // Non-table line, end the table
        currentTable.rows = currentRows;
        tables.push(currentTable);
        console.log('Completed table with', currentRows.length, 'rows (non-table line)');
        currentTable = null;
        currentHeaders = [];
        currentRows = [];
        inTable = false;
        consecutiveEmptyLines = 0;
      }
    }
    
    // Don't forget the last table
    if (currentTable && currentRows.length > 0) {
      currentTable.rows = currentRows;
      tables.push(currentTable);
      console.log('Completed final table with', currentRows.length, 'rows');
    }
    
    console.log('Standard parsing found', tables.length, 'tables');
    return tables;
  };

  // Strategy 2: Alternative table parsing method for different formats
  const parseTablesAlternative = (content) => {
    if (!content || typeof content !== 'string') return [];
    
    const tables = [];
    const lines = content.split('\n');
    let currentTable = null;
    let currentHeaders = [];
    let currentRows = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for lines that contain multiple | characters (potential table rows)
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cleanMarkdown(cell.trim())).filter(cell => cell);
        
        if (cells.length > 1) {
          // If we don't have headers yet, use this as headers
          if (currentHeaders.length === 0) {
            currentHeaders = cells;
            currentTable = {
              title: cleanMarkdown(getTableTitle(lines, i)),
              headers: currentHeaders,
              rows: []
            };
            currentRows = [];
          } else if (cells.length === currentHeaders.length) {
            // This is a data row
            currentRows.push(cells);
          } else if (cells.length !== currentHeaders.length && currentRows.length > 0) {
            // End of current table, save it
            currentTable.rows = currentRows;
            tables.push(currentTable);
            
            // Start new table with these cells as headers
            currentHeaders = cells;
            currentTable = {
              title: cleanMarkdown(getTableTitle(lines, i)),
              headers: currentHeaders,
              rows: []
            };
            currentRows = [];
          }
        }
      } else if (currentTable && currentRows.length > 0 && line === '') {
        // Empty line might indicate end of table
        currentTable.rows = currentRows;
        tables.push(currentTable);
        currentTable = null;
        currentHeaders = [];
        currentRows = [];
      }
    }
    
    // Don't forget the last table
    if (currentTable && currentRows.length > 0) {
      currentTable.rows = currentRows;
      tables.push(currentTable);
    }
    
    console.log('Alternative parsing found tables:', tables);
    return tables;
  };

  // Strategy 3: Aggressive table detection for edge cases
  const parseAggressiveTables = (content) => {
    const tables = [];
    const lines = content.split('\n');
    let currentTable = null;
    let currentHeaders = [];
    let currentRows = [];
    let consecutiveTableLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for any line with multiple pipe characters
      if (line.includes('|')) {
        const cells = line.split('|').map(cell => cleanMarkdown(cell.trim())).filter(cell => cell);
        
        if (cells.length >= 2) {
          consecutiveTableLines++;
          
          // If this is the first table-like line, treat it as headers
          if (currentHeaders.length === 0) {
            currentHeaders = cells;
            currentTable = {
              title: cleanMarkdown(getTableTitle(lines, i)),
              headers: currentHeaders,
              rows: []
            };
            currentRows = [];
          } else if (cells.length === currentHeaders.length) {
            // This is a data row
            currentRows.push(cells);
          } else if (cells.length !== currentHeaders.length && currentRows.length > 0) {
            // Different number of columns - might be a new table
            // Save current table and start new one
            currentTable.rows = currentRows;
            tables.push(currentTable);
            
            currentHeaders = cells;
            currentTable = {
              title: cleanMarkdown(getTableTitle(lines, i)),
              headers: currentHeaders,
              rows: []
            };
            currentRows = [];
          }
        }
      } else {
        // Non-table line
        if (consecutiveTableLines > 0 && currentTable && currentRows.length > 0) {
          // End of table
          currentTable.rows = currentRows;
          tables.push(currentTable);
          currentTable = null;
          currentHeaders = [];
          currentRows = [];
          consecutiveTableLines = 0;
        }
      }
    }
    
    // Don't forget the last table
    if (currentTable && currentRows.length > 0) {
      currentTable.rows = currentRows;
      tables.push(currentTable);
    }
    
    console.log('Aggressive parsing found tables:', tables);
    return tables;
  };

  const getTableTitle = (lines, currentIndex) => {
    // Look for a title above the table (usually a numbered section or bold text)
    for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 10); i--) {
      const line = lines[i].trim();
      
      // Check for bold markdown titles (e.g., **1. Current & Potential Formulations**)
      if (line.startsWith('**') && line.endsWith('**')) {
        const title = line.replace(/\*\*/g, '');
        return title;
      }
      
      // Check for numbered sections (e.g., 1. Current & Potential Formulations)
      if (line.match(/^\d+\./)) {
        return line;
      }
      
      // Check for any non-empty line that's not a table line
      if (line && !line.includes('|') && !line.includes('---') && line.length > 0) {
        return line;
      }
    }
    
    // If no title found, try to look ahead for context
    for (let i = currentIndex + 1; i < Math.min(lines.length, currentIndex + 5); i++) {
      const line = lines[i].trim();
      if (line.startsWith('**') && line.endsWith('**')) {
        const title = line.replace(/\*\*/g, '');
        return title;
      }
    }
    
    return 'Analysis Results';
  };

  const getReportId = () => {
    if (!result?.data) return 'N/A';
    return result.data.report_id || result.data.id || 'N/A';
  };

  const getModelUsed = () => {
    if (!result?.data) return 'N/A';
    return result.data.model_used || result.data.model || 'GPT-4o Search Preview';
  };

  const getProcessingTime = () => {
    if (!result?.processing_time) return 'N/A';
    return `${result.processing_time.toFixed(2)}s`;
  };

  const isMongoSaved = () => {
    if (!result?.data) return false;
    return result.data.mongo_saved || result.data.saved || false;
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
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          🏢 Company Intelligence Search
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          Advanced AI-powered pharmaceutical company analysis with comprehensive insights and market intelligence
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
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g., Pfizer, Johnson & Johnson"
                sx={{ mb: 2 }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="User ID"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
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
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
                  }
                }}
              >
                {loading ? `Searching... ${Math.round(loadingProgress)}%` : 'Search Company'}
              </Button>
              
              {loading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                            {getReportId()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Company:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formData.company_name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Processing Time:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getProcessingTime()}
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

                {/* Parsed Tables */}
                {(() => {
                  const tables = parseAIResponse(getReportContent());
                  if (tables.length > 0) {
                    return tables.map((table, index) => (
                      <Card key={index} sx={{ mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
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
                              maxHeight: 400,
                              overflow: 'auto',
                              border: '1px solid rgba(0,0,0,0.05)',
                              borderRadius: 2
                            }}
                          >
                            <Table stickyHeader size="small">
                              <TableHead>
                                <TableRow>
                                  {table.headers.map((header, headerIndex) => (
                                    <TableCell 
                                      key={headerIndex}
                                      sx={{ 
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {header}
                                    </TableCell>
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
                                        backgroundColor: 'rgba(124, 58, 237, 0.05)' 
                                      }
                                    }}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <TableCell 
                                        key={cellIndex}
                                        sx={{ 
                                          fontSize: '0.875rem',
                                          maxWidth: 200,
                                          wordWrap: 'break-word',
                                          whiteSpace: 'pre-wrap'
                                        }}
                                      >
                                        {cell}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
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

      {/* Snackbar for copy notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default CompanySearch;
