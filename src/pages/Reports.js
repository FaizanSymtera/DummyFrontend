import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  Tabs, Tab, Paper, Alert, CircularProgress, Chip, Accordion,
  AccordionSummary, AccordionDetails, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Snackbar, Avatar, Tooltip
} from '@mui/material';
import {
   Science, Business, Delete,
  ExpandMore, ContentCopy, Refresh, Visibility, Download, Analytics, Info, Source
} from '@mui/icons-material';
import { drugAPI, companyAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [userId, setUserId] = useState('demo_user');
  const [loading, setLoading] = useState(false);
  const [drugReports, setDrugReports] = useState([]);
  const [companyReports, setCompanyReports] = useState([]);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 0) {
        // Load drug reports
        const response = await drugAPI.getUserReports(userId, 50);
        console.log('Drug reports response:', response);
        setDrugReports(response.data?.data?.searches || response.data?.searches || []);
      } else {
        // Load company reports - try multiple approaches
        try {
          // First try to get user-specific company reports
          const response = await companyAPI.getUserReports(userId, 50);
          console.log('Company reports response:', response);
          
          // Try different response structures
          let reports = [];
          if (response.data?.data?.reports) {
            reports = response.data.data.reports;
          } else if (response.data?.reports) {
            reports = response.data.reports;
          } else if (response.data?.data) {
            reports = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
          } else if (Array.isArray(response.data)) {
            reports = response.data;
          }
          
          setCompanyReports(reports);
        } catch (userReportsErr) {
          console.error('User company reports error:', userReportsErr);
          // If getUserReports fails, try getAll as fallback
          try {
            const response = await companyAPI.getAll(50, 0);
            console.log('All company reports response:', response);
            
            let reports = [];
            if (response.data?.data?.reports) {
              reports = response.data.data.reports;
            } else if (response.data?.reports) {
              reports = response.data.reports;
            } else if (response.data?.data) {
              reports = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
            } else if (Array.isArray(response.data)) {
              reports = response.data;
            }
            
            setCompanyReports(reports);
          } catch (allReportsErr) {
            console.error('All company reports error:', allReportsErr);
            setCompanyReports([]); // Empty array if no reports found
          }
        }
      }
    } catch (err) {
      console.error('Load reports error:', err);
      setError(err.userMessage || err.response?.data?.detail || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    if (userId) {
      loadReports();
    }
  }, [userId, activeTab, loadReports]);

  const handleViewReport = async (reportId, type) => {
    try {
      let response;
      if (type === 'drug') {
        response = await drugAPI.getReport(reportId);
      } else {
        response = await companyAPI.getReport(reportId);
      }
      setSelectedReport(response.data);
    } catch (err) {
      console.error('View report error:', err);
      setError(err.userMessage || 'Failed to load report details');
    }
  };

  const handleDeleteReport = async (reportId, type) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      if (type === 'drug') {
        await drugAPI.deleteReport(reportId);
      } else {
        await companyAPI.deleteReport(reportId);
      }
      setSnackbar({ open: true, message: 'Report deleted successfully!', severity: 'success' });
      loadReports();
    } catch (err) {
      console.error('Delete report error:', err);
      setError(err.userMessage || 'Failed to delete report');
    }
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Report ID copied to clipboard!', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'No report ID to copy', severity: 'warning' });
    }
  };

  const downloadReport = async (report, type) => {
    if (!report) {
      setSnackbar({ open: true, message: 'No report to download', severity: 'warning' });
      return;
    }

    try {
      // Import required libraries
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Generate PDF content with parsed tables
      const generatePDFContent = () => {
        const content = getReportContent();
        const tables = parseAIResponse(content);
        const reportName = getReportName(report, type);
        const reportType = getReportType(report, type);
        
        let htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${reportName} - ${reportType} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
              .header h1 { color: #2563eb; margin: 0; font-size: 24px; }
              .header h2 { color: #666; margin: 10px 0 0 0; font-size: 16px; font-weight: normal; }
              .table-section { margin-bottom: 40px; page-break-inside: avoid; }
              .table-title { color: #2563eb; font-size: 18px; margin-bottom: 15px; font-weight: bold; page-break-after: avoid; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; page-break-inside: auto; }
              th { background: #2563eb; color: white; padding: 8px; text-align: left; font-weight: bold; }
              td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background: #f9f9f9; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              .page-break { page-break-before: always; }
              @media print {
                body { margin: 15px; }
                .page-break { page-break-before: always; }
                .table-section { page-break-inside: avoid; }
                .table-title { page-break-after: avoid; }
                tr { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 ${type === 'drug' ? 'Drug' : 'Company'} Intelligence Report</h1>
              <h2>${reportName} - ${reportType} Analysis</h2>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
        `;

        if (tables.length > 0) {
          tables.forEach((table, index) => {
            // Add page break for tables after the first one, but only if the previous table was large
            const shouldAddPageBreak = index > 0 && tables[index - 1].rows.length > 10;
            htmlContent += `
              <div class="table-section ${shouldAddPageBreak ? 'page-break' : ''}">
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
                ${content.replace(/\n/g, '<br>')}
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

      const reportName = getReportName(report, type);
      const reportType = getReportType(report, type);
      const fileName = `${reportName}_${reportType}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(iframe);
      
      setSnackbar({ open: true, message: 'PDF report downloaded successfully!', severity: 'success' });
    } catch (error) {
      console.error('PDF generation error:', error);
      setSnackbar({ open: true, message: 'Failed to generate PDF. Please try again.', severity: 'error' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getReportName = (report, type) => {
    if (type === 'drug') {
      return report.drug_name || report.product_name || report.search_data?.drug_name || 'N/A';
    } else {
      // For company reports, check multiple possible locations
      return report.company_name || 
             report.report?.company_name || 
             report.search_data?.company_name || 
             'N/A';
    }
  };

  const getReportType = (report, type) => {
    if (type === 'drug') {
      return report.product_type || report.analysis_type || report.search_data?.product_type || 'Comprehensive';
    } else {
      return report.analysis_type || report.search_data?.analysis_type || 'Comprehensive';
    }
  };

  const getReportId = (report) => {
    // For company reports, the ID might be in different fields
    // Priority: report_id (the actual report identifier) > _id (MongoDB ObjectId)
    if (report.report_id) {
      return String(report.report_id);
    } else if (report.report && report.report.report_id) {
      return String(report.report.report_id);
    } else if (report.id) {
      return String(report.id);
    } else if (report._id) {
      return String(report._id);
    } else if (report.report && report.report._id) {
      return String(report.report._id);
    }
    return 'N/A';
  };

  const getReportContent = () => {
    if (!selectedReport?.data) return 'No content available';
    
    // Try multiple possible content fields
    let content = null;
    const data = selectedReport.data;
    
    console.log('Extracting content from report data:', data);
    
    // Check all possible content fields
    const contentFields = [
      'product_information',
      'report_content', 
      'company_information',
      'content',
      'analysis_content',
      'result',
      'response',
      'data'
    ];
    
    // First, try to find string content in top-level fields
    for (const field of contentFields) {
      if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
        content = data[field];
        console.log(`Found content in field: ${field}`);
        console.log(`Content preview: ${content.substring(0, 200)}...`);
        break;
      }
    }
    
    // If no string content found, try to extract from nested objects
    if (!content) {
      // Check for company report structure: data.report.report_content
      if (data.report && data.report.report_content && typeof data.report.report_content === 'string') {
        content = data.report.report_content;
        console.log('Found content in company report structure: data.report.report_content');
        console.log(`Content preview: ${content.substring(0, 200)}...`);
      }
      // Check for deeply nested structure: data.search_data.search_data.product_information
      else if (data.search_data && data.search_data.search_data && data.search_data.search_data.product_information) {
        content = data.search_data.search_data.product_information;
        console.log('Found content in deeply nested structure: data.search_data.search_data.product_information');
        console.log(`Content preview: ${content.substring(0, 200)}...`);
      } else {
        // Try other nested structures
        for (const field of contentFields) {
          if (data[field] && typeof data[field] === 'object') {
            // Check if this object has nested content fields
            const nestedContentFields = [
              'product_information',
              'report_content', 
              'company_information',
              'content',
              'analysis_content',
              'result',
              'response',
              'data'
            ];
            
            for (const nestedField of nestedContentFields) {
              if (data[field][nestedField] && typeof data[field][nestedField] === 'string' && data[field][nestedField].trim()) {
                content = data[field][nestedField];
                console.log(`Found content in nested field: ${field}.${nestedField}`);
                console.log(`Content preview: ${content.substring(0, 200)}...`);
                break;
              }
            }
            
            if (content) break;
            
            // If no nested string content, try to stringify the object
            const objContent = JSON.stringify(data[field], null, 2);
            if (objContent.includes('|') && objContent.includes('---')) {
              content = objContent;
              console.log(`Found table content in object field: ${field}`);
              break;
            }
          }
        }
      }
    }
    
    // If still no content, try to find any field with table-like content
    if (!content) {
      const allData = JSON.stringify(data, null, 2);
      if (allData.includes('|') && allData.includes('---')) {
        content = allData;
        console.log('Found table content in overall data structure');
      } else {
        content = allData;
        console.log('No table content found, using full data structure');
      }
    }
    
    console.log('Final content being parsed:', content);
    console.log('Content length:', content.length);
    console.log('Has pipe characters:', content.includes('|'));
    console.log('Has table separators:', content.includes('---'));
    console.log('Report data structure:', data);
    
    return content;
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
    
    console.log('Starting table parsing for content length:', content.length);
    
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

  // Alternative table parsing method for different formats
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
        console.log('Found bold title:', title);
        return title;
      }
      
      // Check for numbered sections (e.g., 1. Current & Potential Formulations)
      if (line.match(/^\d+\./)) {
        console.log('Found numbered title:', line);
        return line;
      }
      
      // Check for any non-empty line that's not a table line
      if (line && !line.includes('|') && !line.includes('---') && line.length > 0) {
        console.log('Found potential title:', line);
        return line;
      }
    }
    
    // If no title found, try to look ahead for context
    for (let i = currentIndex + 1; i < Math.min(lines.length, currentIndex + 5); i++) {
      const line = lines[i].trim();
      if (line.startsWith('**') && line.endsWith('**')) {
        const title = line.replace(/\*\*/g, '');
        console.log('Found title ahead:', title);
        return title;
      }
    }
    
    console.log('No title found, using default');
    return 'Analysis Results';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 Reports Management
      </Typography>

      <Grid container spacing={3}>
        {/* Search Controls */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Controls
              </Typography>
              
              <TextField
                fullWidth
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                onClick={loadReports}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Loading...' : 'Refresh Reports'}
              </Button>

              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="fullWidth"
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Science />
                      Drug Reports
                    </Box>
                  }
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business />
                      Company Reports
                    </Box>
                  }
                />
              </Tabs>
            </CardContent>
          </Card>
        </Grid>

        {/* Reports List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {activeTab === 0 ? 'Drug Reports' : 'Company Reports'}
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
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Report ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(activeTab === 0 ? drugReports : companyReports).map((report, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {getReportId(report)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getReportName(report, activeTab === 0 ? 'drug' : 'company')}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getReportType(report, activeTab === 0 ? 'drug' : 'company')} 
                              size="small" 
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(report.created_at || report.timestamp || report.created_date)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleViewReport(getReportId(report), activeTab === 0 ? 'drug' : 'company')}
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(getReportId(report))}
                            >
                              <ContentCopy />
                            </IconButton>
                                                         <IconButton
                               size="small"
                               onClick={() => downloadReport(report, activeTab === 0 ? 'drug' : 'company')}
                             >
                               <Download />
                             </IconButton>
                             <IconButton
                               size="small"
                               onClick={() => {
                                 const reportId = getReportId(report);
                                 console.log('🔍 Reports page - Report object:', report);
                                 console.log('🔍 Reports page - getReportId result:', reportId);
                                 console.log('🔍 Reports page - getReportId type:', typeof reportId);
                                 console.log('🔍 Reports page - Navigating to:', `/sources?reportId=${reportId}`);
                                 
                                 // Ensure we have a valid string
                                 if (typeof reportId === 'string' && reportId !== 'N/A' && reportId !== '[object Object]') {
                                   navigate(`/sources?reportId=${encodeURIComponent(reportId)}`);
                                 } else {
                                   console.error('❌ Invalid report ID:', reportId);
                                   alert('Invalid report ID. Please try again.');
                                 }
                               }}
                               title="View Sources"
                             >
                               <Source />
                             </IconButton>
                             <IconButton
                               size="small"
                               color="error"
                               onClick={() => handleDeleteReport(getReportId(report), activeTab === 0 ? 'drug' : 'company')}
                             >
                               <Delete />
                             </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {(activeTab === 0 ? drugReports : companyReports).length === 0 && !loading && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No {activeTab === 0 ? 'drug' : 'company'} reports found for user: {userId}
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Report Details */}
        {selectedReport && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Report Details
                  </Typography>
                                     <Box sx={{ display: 'flex', gap: 1 }}>
                     <Button
                       size="small"
                       startIcon={<Download />}
                       onClick={() => downloadReport(selectedReport, activeTab === 0 ? 'drug' : 'company')}
                     >
                       Download
                     </Button>
                                           <Button
                        size="small"
                        onClick={() => {
                          const content = getReportContent();
                          const tables = parseAIResponse(content);
                          console.log('Manual test - Content:', content.substring(0, 500));
                          console.log('Manual test - Tables found:', tables.length);
                          console.log('Manual test - Tables:', tables);
                          
                          // Show the first 1000 characters to see the structure
                          console.log('=== FIRST 1000 CHARACTERS ===');
                          console.log(content.substring(0, 1000));
                          console.log('=== END FIRST 1000 CHARACTERS ===');
                          
                          // Show all lines that contain table separators
                          const lines = content.split('\n');
                          console.log('=== LINES WITH TABLE SEPARATORS ===');
                          lines.forEach((line, index) => {
                            if (line.includes('---')) {
                              console.log(`Line ${index}: "${line}"`);
                            }
                          });
                          console.log('=== END TABLE SEPARATORS ===');
                          
                          // Show the specific area around the first table
                          console.log('=== FIRST TABLE AREA ===');
                          const firstTableIndex = content.indexOf('**1. Current & Potential Formulations**');
                          if (firstTableIndex !== -1) {
                            const start = Math.max(0, firstTableIndex - 100);
                            const end = Math.min(content.length, firstTableIndex + 1000);
                            console.log('First table found at index:', firstTableIndex);
                            console.log('Content around first table:');
                            console.log(content.substring(start, end));
                          } else {
                            console.log('First table title not found in content');
                          }
                          console.log('=== END FIRST TABLE AREA ===');
                        }}
                      >
                        Test Parsing
                      </Button>
                     <Button
                       size="small"
                       onClick={() => setSelectedReport(null)}
                     >
                       Close
                     </Button>
                   </Box>
                </Box>

                                 <Grid container spacing={2} sx={{ mb: 2 }}>
                   <Grid item xs={12} md={6}>
                     <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                       <Typography variant="h6" sx={{ mb: 2, color: '#2563eb', fontWeight: 'bold' }}>
                         {getReportName(selectedReport.data, activeTab === 0 ? 'drug' : 'company')}: {getReportType(selectedReport.data, activeTab === 0 ? 'drug' : 'company')}
                       </Typography>
                       <Typography variant="body2" sx={{ mb: 1 }}>
                         <strong>Report ID:</strong> {getReportId(selectedReport.data)}
                       </Typography>
                       <Typography variant="body2">
                         <strong>Success:</strong> 
                         <Chip 
                           label={selectedReport.success ? 'Yes' : 'No'} 
                           color={selectedReport.success ? 'success' : 'error'}
                           size="small"
                           sx={{ ml: 1 }}
                         />
                       </Typography>
                     </Paper>
                   </Grid>
                 </Grid>

                {/* Parsed Tables */}
                {(() => {
                  const content = getReportContent();
                  const tables = parseAIResponse(content);
                  
                  if (tables.length > 0) {
                    return tables.map((table, index) => (
                      <Card key={index} sx={{ mb: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
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
                                    <TableCell 
                                      key={headerIndex}
                                      sx={{ 
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                                        backgroundColor: 'rgba(37, 99, 235, 0.05)' 
                                      }
                                    }}
                                  >
                                    {row.map((cell, cellIndex) => (
                                      <Tooltip 
                                        key={cellIndex}
                                        title={cell && cell.length > 100 ? cell : ''}
                                        placement="top"
                                        arrow
                                      >
                                        <TableCell 
                                          sx={{ 
                                            fontSize: '0.875rem',
                                            minWidth: 150,
                                            maxWidth: 'none',
                                            width: 'auto',
                                            wordWrap: 'break-word',
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        >
                                          {cell}
                                        </TableCell>
                                      </Tooltip>
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
                            {content}
                          </pre>
                        </Paper>
                      </AccordionDetails>
                    </Accordion>
                  );
                })()}


              </CardContent>
            </Card>
          </Grid>
        )}
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

export default Reports;
