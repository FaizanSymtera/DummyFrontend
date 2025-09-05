import React, { useState } from 'react';
import {
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Paper, 
  Alert, 
  Accordion,
  AccordionSummary, 
  AccordionDetails, 
  Snackbar,
  LinearProgress,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import {
   Science, 
   ExpandMore, 
   Refresh,
   Storage,
   Assessment,
   Business
 } from '@mui/icons-material';

import { warehouseAPI } from '../services/api';
// import { parseMarkdownToTables } from '../utils/markdownParser'; // Not used in custom parser

const Warehouse = () => {
  const [formData, setFormData] = useState({
    query: 'Apixaban',
    entity_type: 'drug',
    user_id: 'bd6eb89e-6cdc-4a36-90ef-d0f2875f91ea'
  });
  const [warehouseId, setWarehouseId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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



  // Function to parse tables from markdown content - simplified parser for backend response
  const parseTablesFromContent = (content) => {
    if (!content || typeof content !== 'string') return [];
    
    console.log('=== PARSING TABLES FROM CONTENT ===');
    console.log('Content length:', content.length);
    console.log('Content preview (first 1000 chars):', content.substring(0, 1000));
    
    const lines = content.split('\n');
    const tables = [];
    let currentTable = null;
    let inTable = false;
    let tableTitle = '';
    let headerRowFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Look for numbered section titles that indicate new tables
      // Match patterns like "1. Market Size & Growth Analysis", "2. Competitive Landscape", etc.
      if (line.match(/^\d+\.\s+[A-Z\s&/]+(?:ANALYSIS|LANDSCAPE|STATUS|OPPORTUNITIES|CHALLENGES|SPECIFICATIONS|PROPERTIES|CONSIDERATIONS|IMPLICATIONS|INTERACTIONS|RELATIONSHIPS|MATRIX|OVERVIEW|FORMULATIONS|DEVELOPMENT|PARAMETERS)$/i)) {
        
        // End current table if we're in one
        if (inTable && currentTable && currentTable.headers.length > 0) {
          tables.push(currentTable);
          console.log('Completed table:', currentTable.title, 'with', currentTable.rows.length, 'rows');
        }
        
        // Start new table
        tableTitle = line.trim();
        console.log('Found table title:', tableTitle);
        inTable = false;
        currentTable = null;
        headerRowFound = false;
        continue;
      }
      
      // Check if this line contains table data (has | characters)
      if (line.includes('|')) {
        // Check if this is a table separator line (contains only dashes, spaces, and pipes)
        if (line.match(/^[\s\-|]+$/)) {
          console.log('Found table separator line');
          headerRowFound = true;
          continue;
        }
        
        // Parse the table row - preserve empty cells to maintain column alignment
        let cells = line.split('|').map(cell => cell.trim());
        
        console.log('Raw cells from split:', cells);
        
        // Remove empty cells from the beginning and end (caused by leading/trailing pipes)
        while (cells.length > 0 && cells[0] === '') {
          cells.shift();
        }
        while (cells.length > 0 && cells[cells.length - 1] === '') {
          cells.pop();
        }
        
        console.log('Cells after removing leading/trailing empty:', cells);
        
        console.log('Found line with pipes, cells:', cells);
        
        // Check if this is a valid table row (has at least 2 non-empty cells)
        const nonEmptyCells = cells.filter(cell => cell !== '');
        if (nonEmptyCells.length >= 2) {
          if (!inTable) {
            // Start new table
            inTable = true;
            headerRowFound = false;
            // Don't use summary text as table title
            let finalTitle = tableTitle;
            if (!tableTitle || tableTitle.includes('Table Summary') || tableTitle.includes('This table')) {
              // Try to find a better title from recent lines
              let betterTitle = `Table ${tables.length + 1}`;
              for (let j = Math.max(0, i - 5); j < i; j++) {
                const prevLine = lines[j].trim();
                if (prevLine.match(/^\d+\.\s+[A-Z\s&/]+/i) && !prevLine.includes('|')) {
                  betterTitle = prevLine;
                  break;
                }
              }
              finalTitle = betterTitle;
              console.log('Using fallback title:', finalTitle);
            }
            
            currentTable = {
              title: finalTitle || `Table ${tables.length + 1}`,
              headers: [],
              rows: []
            };
            console.log('Starting new table:', currentTable.title);
            console.log('Table title variable:', tableTitle);
            console.log('Final title used:', finalTitle);
            console.log('Current line being processed:', line);
          }
          
          // Clean the cells - preserve empty cells to maintain column alignment
          const cleanCells = cells.map(cell => 
            cell.trim()
              .replace(/\*\*/g, '') // Remove bold formatting
              .replace(/\*/g, '')   // Remove italic formatting
              .replace(/`/g, '')    // Remove code formatting
              .trim()
          );
          
          console.log('Original cells:', cells);
          console.log('Cleaned cells:', cleanCells);
          console.log('Empty cells count:', cleanCells.filter(cell => cell === '').length);
          
          if (!headerRowFound) {
            // This is the header row
            // Check if we already have a table with different column count
            if (currentTable && currentTable.headers.length > 0 && cleanCells.length !== currentTable.headers.length) {
              // Different column count - end current table and start new one
              tables.push(currentTable);
              console.log('Completed table due to different column count:', currentTable.title, 'with', currentTable.rows.length, 'rows');
              
              // Start new table
              currentTable = {
                title: tableTitle || `Table ${tables.length + 1}`,
                headers: cleanCells,
                rows: []
              };
              console.log('Starting new table with different structure:', currentTable.title);
            } else {
              // Same structure or first table
            currentTable.headers = cleanCells;
            console.log('Set headers:', cleanCells);
            }
            headerRowFound = true;
          } else {
            // This is a data row
            const nonEmptyDataCells = cleanCells.filter(cell => cell !== '');
            console.log('Data row - non-empty cells:', nonEmptyDataCells.length, 'out of', cleanCells.length);
            console.log('Data row - cleanCells:', cleanCells);
            if (nonEmptyDataCells.length > 0) {
              // Ensure row has same number of columns as headers
              const paddedCells = [...cleanCells];
              while (paddedCells.length < currentTable.headers.length) {
                paddedCells.push('');
              }
              // Truncate if row has more columns than headers
              const finalRow = paddedCells.slice(0, currentTable.headers.length);
              console.log('Final row before adding:', finalRow);
              console.log('Empty cells in final row:', finalRow.filter(cell => cell === '').length);
              currentTable.rows.push(finalRow);
              console.log('Added row:', finalRow);
            }
          }
        }
      } else if (inTable) {
        // Check if this is a table summary line
        if (line.includes('**Table Summary:**') || line.includes('Table Summary:')) {
          console.log('Found table summary, continuing table');
          console.log('Table title before summary:', tableTitle);
          // Don't let summary text overwrite the table title
          if (tableTitle && !tableTitle.includes('Table Summary')) {
            console.log('Preserving existing table title:', tableTitle);
          }
          continue;
        }
        
        // Check if this line looks like it could be a table title (but not a summary)
        if (line.match(/^\d+\.\s+[A-Z\s&/]+(?:ANALYSIS|IMPLICATIONS|INTERACTIONS|RELATIONSHIPS)$/i) && !line.includes('Table Summary')) {
          console.log('Found potential table title in non-table content:', line);
          // Don't set this as table title here, just log it
        }
        
        // Check if this is a table summary that might be incorrectly used as title
        if (line.includes('Table Summary:') || line.includes('**Table Summary:**')) {
          console.log('Found table summary line:', line);
          console.log('Current table title variable:', tableTitle);
          console.log('Current table object:', currentTable);
          if (currentTable) {
            console.log('Current table title in object:', currentTable.title);
          }
        }
        
        // End current table if we hit non-table content
        if (currentTable && currentTable.headers.length > 0) {
          tables.push(currentTable);
          console.log('Completed table:', currentTable.title, 'with', currentTable.rows.length, 'rows');
        }
        inTable = false;
        currentTable = null;
        tableTitle = '';
        headerRowFound = false;
      }
    }
    
    // Add final table if exists
    if (inTable && currentTable && currentTable.headers.length > 0) {
      tables.push(currentTable);
      console.log('Completed final table:', currentTable.title, 'with', currentTable.rows.length, 'rows');
    }
    
    console.log('Found tables:', tables.length);
    tables.forEach((table, index) => {
      console.log(`Table ${index + 1}: "${table.title}" - Headers: ${table.headers.length}, Rows: ${table.rows.length}`);
      if (table.rows.length > 0) {
        console.log('First row:', table.rows[0]);
      }
    });
    
    // Post-process tables to fix any titles that are still showing summary text
    tables.forEach((table, index) => {
      if (table.title && (table.title.includes('Table Summary') || table.title.includes('This table'))) {
        // Try to find a better title from the content
        let betterTitle = `Table ${index + 1}`;
        
        // Look for potential titles in the content
        const contentLines = content.split('\n');
        for (let i = 0; i < contentLines.length; i++) {
          const line = contentLines[i];
          if (line.match(/^\d+\.\s+[A-Z\s&/]+$/i) && !line.includes('Table Summary')) {
            // Found a potential title, use it
            betterTitle = line.trim();
            console.log(`Found better title for table ${index + 1}: "${betterTitle}"`);
            break;
          }
        }
        
        console.log(`Fixing table ${index + 1} title from "${table.title}" to "${betterTitle}"`);
        table.title = betterTitle;
      }
    });
    
    return tables;
  };
  


  // Function to process markdown formatting
  const processMarkdown = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Process headers (### Header)
    text = text.replace(/^###\s+(.*)$/gm, '<h3 style="font-size: 1.1rem; font-weight: 600; color: #1976d2; margin: 1rem 0 0.5rem 0; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.25rem;">$1</h3>');
    
    // Process subheaders (## Header)
    text = text.replace(/^##\s+(.*)$/gm, '<h2 style="font-size: 1.2rem; font-weight: 600; color: #1976d2; margin: 1.2rem 0 0.6rem 0; border-bottom: 2px solid #1976d2; padding-bottom: 0.3rem;">$1</h2>');
    
    // Process main headers (# Header)
    text = text.replace(/^#\s+(.*)$/gm, '<h1 style="font-size: 1.4rem; font-weight: 700; color: #1976d2; margin: 1.5rem 0 0.8rem 0; border-bottom: 3px solid #1976d2; padding-bottom: 0.4rem;">$1</h1>');
    
    // Process bold text (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process italic text (*text*)
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Process horizontal rules (---)
    text = text.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 1rem 0;" />');
    
    // Process links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #1976d2; text-decoration: none;">$1</a>');
    
    // Process line breaks - convert double line breaks to paragraph breaks
    text = text.replace(/\n\n/g, '</p><p style="margin: 0.5rem 0;">');
    
    // Wrap the entire content in a paragraph if it's not already wrapped
    if (!text.startsWith('<')) {
      text = '<p style="margin: 0.5rem 0;">' + text + '</p>';
    }
    
    return text;
  };

  // Function to extract non-table content
  const extractNonTableContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    const lines = content.split('\n');
    const nonTableLines = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        nonTableLines.push('');
        continue;
      }
      
      // Check if this line starts a table
      if (line.includes('|') && line.split('|').filter(cell => cell.trim() !== '').length >= 2) {
        inTable = true;
        continue;
      }
      
      // Check if we're exiting a table
      if (inTable && !line.includes('|')) {
        inTable = false;
      }
      
      // Add non-table lines
      if (!inTable) {
        nonTableLines.push(line);
      }
    }
    
    return nonTableLines.join('\n');
  };

  // Function to extract Global Market Analysis content (excluding US) - UNUSED
  /*
  const extractGlobalAnalysisContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    const lines = content.split('\n');
    const globalLines = [];
    let inGlobalSection = false;
    let inTable = false;
    
    // Look for patterns that indicate global market analysis
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for Global analysis indicators - be more flexible
      if ((line.toLowerCase().includes('global') || 
           line.toLowerCase().includes('worldwide') ||
           line.toLowerCase().includes('international')) && 
          (line.toLowerCase().includes('market') || 
           line.toLowerCase().includes('analysis') ||
           line.toLowerCase().includes('overview')) &&
          !line.toLowerCase().includes('us')) {
        inGlobalSection = true;
        globalLines.push(line);
        continue;
      }
      
      // Look for US analysis indicators to stop Global section
      if (line.toLowerCase().includes('us') && 
          (line.toLowerCase().includes('market') || 
           line.toLowerCase().includes('analysis') ||
           line.toLowerCase().includes('specific'))) {
        inGlobalSection = false;
        break;
      }
      
      // If we're in Global section, collect content
      if (inGlobalSection) {
        // Check if this line starts a table
        if (line.includes('|') && line.split('|').filter(cell => cell.trim() !== '').length >= 2) {
          inTable = true;
        }
        
        // Check if we're exiting a table
        if (inTable && !line.includes('|')) {
          inTable = false;
        }
        
        globalLines.push(line);
      }
    }
    
    // If we didn't find explicit global indicators, try to infer from content
    if (globalLines.length === 0) {
      // Look for market size data that seems global (not US-specific)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toLowerCase().includes('market size') && 
            !line.toLowerCase().includes('us') &&
            !line.toLowerCase().includes('united states')) {
          globalLines.push(line);
        }
      }
    }
    
    return globalLines.join('\n').trim();
  };
  */
  
  // Function to extract US Market Analysis content - UNUSED
  /*
  const extractUSAnalysisContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    const lines = content.split('\n');
    const usLines = [];
    let inUSSection = false;
    let inTable = false;
    
    // Look for patterns that indicate US market analysis
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for US analysis indicators - be more flexible
      if (line.toLowerCase().includes('us') || 
          line.toLowerCase().includes('united states') ||
          line.toLowerCase().includes('american')) {
        if (line.toLowerCase().includes('market') || 
            line.toLowerCase().includes('analysis') ||
            line.toLowerCase().includes('specific') ||
            line.toLowerCase().includes('approval') ||
            line.toLowerCase().includes('patent')) {
          inUSSection = true;
          usLines.push(line);
          continue;
        }
      }
      
      // If we're in US section, collect content
      if (inUSSection) {
        // Check if this line starts a table
        if (line.includes('|') && line.split('|').filter(cell => cell.trim() !== '').length >= 2) {
          inTable = true;
        }
        
        // Check if we're exiting a table
        if (inTable && !line.includes('|')) {
          inTable = false;
        }
        
        usLines.push(line);
      }
    }
    
    // If we didn't find explicit US indicators, try to infer from content
    if (usLines.length === 0) {
      // Look for US-specific data like FDA approval dates, US patent info
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if ((line.toLowerCase().includes('fda') || 
             line.toLowerCase().includes('approval') ||
             line.toLowerCase().includes('patent')) &&
            line.toLowerCase().includes('us')) {
          usLines.push(line);
        }
      }
    }
    
    return usLines.join('\n').trim();
  };
  */
  
  // Function to extract and distribute concluding content across tables
  const extractConcludingContent = (content) => {
    if (!content || typeof content !== 'string') return [];
    
    const lines = content.split('\n');
    const concludingLines = [];
    let inTable = false;
    let foundConcludingContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line starts a table
      if (line.includes('|') && line.split('|').filter(cell => cell.trim() !== '').length >= 2) {
        inTable = true;
        continue;
      }
      
      // Check if we're exiting a table
      if (inTable && !line.includes('|')) {
        inTable = false;
        // If we've found concluding content before, this might be the start of it
        if (foundConcludingContent) {
          break;
        }
      }
      
      // Look for concluding content patterns (usually after all tables)
      if (!inTable && !foundConcludingContent) {
        // Check if this looks like concluding content (contains keywords like "overview", "analysis", "implications")
        if (line.toLowerCase().includes('overview') || 
            line.toLowerCase().includes('analysis') || 
            line.toLowerCase().includes('implications') ||
            line.toLowerCase().includes('conclusion') ||
            line.toLowerCase().includes('summary') ||
            (line.startsWith('**') && line.endsWith('**'))) {
          foundConcludingContent = true;
        }
      }
      
      // Collect concluding content
      if (foundConcludingContent) {
        concludingLines.push(line);
      }
    }
    
    if (concludingLines.length === 0) return [];
    
    // Join the concluding content
    const concludingText = concludingLines.join('\n').trim();
    
    // Split the concluding content into chunks to distribute across tables
    // Look for natural break points like bold headers or section markers
    const chunks = [];
    const lines2 = concludingText.split('\n');
    let currentChunk = [];
    
    for (const line of lines2) {
      // If we find a bold header (like "**Absorption**"), start a new chunk
      if (line.startsWith('**') && line.endsWith('**')) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.join('\n').trim());
          currentChunk = [];
        }
      }
      currentChunk.push(line);
    }
    
    // Add the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n').trim());
    }
    
    // If we couldn't split into chunks, just return the whole text as one chunk
    if (chunks.length === 0) {
      chunks.push(concludingText);
    }
    
    return chunks;
  };

  // Function to format section titles for display
  const formatSectionTitle = (title) => {
    const titleMap = {
      'market_analysis': 'Market Analysis',
      'formulation_analysis': 'Formulation Analysis',
      'pharmacokinetic_analysis': 'Pharmacokinetic Analysis',
      'dosage_and_opportunity_matrix': 'Dosage & Opportunity Matrix',
      'drug_search': 'Drug Search'
    };
    return titleMap[title] || title.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Manual section extraction as fallback for CrewAI output
  const manualSectionExtraction = (content) => {
    if (!content || typeof content !== 'string') return { tables: [], sections: [] };
    
    console.log('Manual section extraction started');
    
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    // Look for section markers in CrewAI output
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section headers (various formats CrewAI might use)
      if (line.startsWith('#') || 
          line.match(/^(Market|Formulation|Pharmacokinetic|Dosage|Drug)/i) ||
          line.match(/^(\d+\.\s*)(Market|Formulation|Pharmacokinetic|Dosage|Drug)/i)) {
        
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // Determine section type from the line
        let sectionType = 'unknown';
        if (line.toLowerCase().includes('market')) sectionType = 'market_analysis';
        else if (line.toLowerCase().includes('formulation')) sectionType = 'formulation_analysis';
        else if (line.toLowerCase().includes('pharmacokinetic')) sectionType = 'pharmacokinetic_analysis';
        else if (line.toLowerCase().includes('dosage')) sectionType = 'dosage_and_opportunity_matrix';
        else if (line.toLowerCase().includes('drug')) sectionType = 'drug_search';
        
        currentSection = sectionType;
        currentContent = [line];
        console.log('Manual extraction found section:', sectionType);
      } else if (currentSection) {
        // Add content to current section
        currentContent.push(line);
      }
    }
    
    // Add the last section
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }
    
    console.log('Manual extraction completed, found sections:', sections.map(s => s.title));
    return { tables: [], sections: sections };
  };

  // Enhanced content parsing function that handles both tables and sections
  const parseContentSections = (content) => {
    if (!content || typeof content !== 'string') return { tables: [], sections: [] };
    
    console.log('=== PARSING CONTENT START ===');
    console.log('Content length:', content.length);
    console.log('Content preview (first 500 chars):', content.substring(0, 500));
    
    const sections = [];
    const lines = content.split('\n');
    
    // Debug: Look for all lines that start with #
    const hashLines = lines.filter(line => line.trim().startsWith('#'));
    console.log('Lines starting with #:', hashLines);
    let currentSection = null;
    let currentContent = [];
    
    // Define the expected 5 sections with their variations
    const expectedSections = [
      { key: 'market_analysis', patterns: ['market analysis', 'market_analysis', 'market'] },
      { key: 'formulation_analysis', patterns: ['formulation analysis', 'formulation_analysis', 'formulation'] },
      { key: 'pharmacokinetic_analysis', patterns: ['pharmacokinetic analysis', 'pharmacokinetic_analysis', 'pharmacokinetic'] },
      { key: 'dosage_and_opportunity_matrix', patterns: ['dosage and opportunity matrix', 'dosage_and_opportunity_matrix', 'dosage & opportunity matrix', 'dosage'] },
      { key: 'drug_search', patterns: ['drug search', 'drug_search', 'drug'] }
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Look for main section headers (# Section Name format) - only single hash, not subsections
      let isSectionHeader = false;
      let sectionKey = '';
      
      // Only match single hash headers (main sections), not subsections with multiple hashes
      if (line.startsWith('#') && !line.startsWith('##')) {
        const sectionTitle = line.replace(/^#\s*/, '').trim();
        const titleLower = sectionTitle.toLowerCase();
        
        // Check if this matches any expected section - be more specific
        for (const expectedSection of expectedSections) {
          for (const pattern of expectedSection.patterns) {
            const patternLower = pattern.toLowerCase();
            // More specific matching - the title should be close to the pattern
            if (titleLower === patternLower || 
                (titleLower.includes(patternLower) && patternLower.length > 3) ||
                (patternLower.includes(titleLower) && titleLower.length > 3)) {
              isSectionHeader = true;
              sectionKey = expectedSection.key;
              break;
            }
          }
          if (isSectionHeader) break;
        }
      }
      
      if (isSectionHeader) {
        console.log('Found section header:', line, '->', sectionKey);
        
        // Save previous section if exists
        if (currentSection && currentContent.length > 0) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
          console.log('Added section:', currentSection, 'with content length:', currentContent.join('\n').trim().length);
        }
        
        // Start new section
        currentSection = sectionKey;
        currentContent = [];
      } else if (currentSection) {
        // Add content to current section
        currentContent.push(line);
      }
    }
    
    // Add final section if exists
    if (currentSection && currentContent.length > 0) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
      console.log('Added final section:', currentSection, 'with content length:', currentContent.join('\n').trim().length);
    }
    
    console.log('=== PARSING CONTENT END ===');
    console.log('Found sections:', sections.map(s => s.title));
    
    return { tables: [], sections };
  };

  // Combined function to handle both extraction and report generation
  const handleStartReportGeneration = async () => {
    console.log('Button clicked! Starting report generation...');
    console.log('Form data:', formData);
    
    if (!formData.query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    if (!formData.user_id.trim()) {
      setError('Please enter a valid User ID');
      return;
    }

    // Show initial submission popup
    const entityTypeLabel = formData.entity_type === 'drug' ? 'drug' : 'company';
    setSnackbar({
      open: true,
      message: `Your request for report generation of ${entityTypeLabel}: ${formData.query} has been submitted.`,
      severity: 'info'
    });

    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Stage 1: Extract raw data to warehouse
      console.log('Starting raw data extraction with data:', formData);
      
      // Simulate progress updates for extraction
      const extractionProgressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 25) {
            clearInterval(extractionProgressInterval);
            return 25;
          }
          return prev + 5;
        });
      }, 300);

      const extractionResponse = await warehouseAPI.extractRawData(formData);
      clearInterval(extractionProgressInterval);
      setLoadingProgress(25);

      console.log('Raw data extraction response:', extractionResponse);
      
      if (!extractionResponse.data || !extractionResponse.data.success) {
        throw new Error(extractionResponse.data?.message || 'Failed to extract raw data');
      }

      const warehouseId = extractionResponse.data.data.warehouse_id;
      setWarehouseId(warehouseId);
      
      // Stage 2: Generate report from warehouse
      console.log('Starting report generation from warehouse:', warehouseId);
      
      // Simulate progress updates for report generation
      const reportProgressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 75) {
            clearInterval(reportProgressInterval);
            return 75;
          }
          return prev + 5;
        });
      }, 300);

      const reportResponse = await warehouseAPI.generateReportFromWarehouse({
        warehouse_id: warehouseId,
        user_id: formData.user_id,
        report_sections: reportSections,
        agent_cycles_per_section: 3
      });
      
      clearInterval(reportProgressInterval);
      setLoadingProgress(100);

      console.log('Report generation response:', reportResponse);
      
      if (reportResponse.data && reportResponse.data.success) {
        const reportData = reportResponse.data.data;
        setReportData(reportData);
        
        // Show success popup
        setSnackbar({
          open: true,
          message: 'Your report has been generated successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(reportResponse.data?.message || 'Failed to generate report');
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
    setWarehouseId('');
    setReportData(null);
    setError(null);
    setFormData({
      query: 'Apixaban',
      entity_type: 'drug',
      user_id: 'bd6eb89e-6cdc-4a36-90ef-d0f2875f91ea'
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Storage color="primary" />
        Data Warehouse & Report Generation
      </Typography>
      


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

               <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                 <Button
                   variant="contained"
                   onClick={handleStartReportGeneration}
                   disabled={loading || !formData.query.trim()}
                   startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Assessment />}
                   title={!formData.query.trim() ? 'Please enter a search query first' : 'Click to start generating report'}
                   sx={{ 
                     background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                     minWidth: '200px',
                     height: '48px',
                     fontSize: '1rem',
                     fontWeight: 600,
                     boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                     '&:hover': {
                       background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                       boxShadow: '0 6px 16px rgba(37, 99, 235, 0.4)',
                     }
                   }}
                 >
                   {loading ? 'Generating Report...' : 'Start Generating Report'}
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
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: loadingProgress <= 25 ? 
                          'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' :
                          loadingProgress <= 75 ? 
                          'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' :
                          'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                    {loadingProgress <= 25 ? '🔄 Extracting raw data...' : 
                     loadingProgress <= 75 ? '📊 Generating report...' : 
                     '✨ Finalizing report...'} {loadingProgress}%
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
                          <strong>Warehouse ID:</strong> {reportData.warehouse_id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Entity Type:</strong> {reportData.entity_type}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Sections Generated:</strong> {reportData.sections_generated?.length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Processing Time:</strong> {reportData.processing_time?.toFixed(2) || 'N/A'}s
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Report Content - Using sectional_report from backend */}
                  {reportData.sectional_report && (
                    <Accordion sx={{ mt: 2 }}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="subtitle1">Report Content - All 5 Sections</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {(() => {
                          try {
                            // Parse the sectional_report content to extract individual sections
                            console.log('Report data structure:', {
                              hasSectionalReport: !!reportData.sectional_report,
                              sectionalReportLength: reportData.sectional_report ? reportData.sectional_report.length : 0,
                              sectionsGenerated: reportData.sections_generated || []
                            });
                            
                            // Parse the sectional_report content to extract sections
                            console.log('Raw sectional_report content:', reportData.sectional_report);
                            console.log('Raw sectional_report content (first 2000 chars):', reportData.sectional_report.substring(0, 2000));
                            let parsedContent = parseContentSections(reportData.sectional_report);
                            console.log('Parsed content result:', parsedContent);
                            
                            // Fallback: if parsing fails, try manual section extraction
                            if (!parsedContent.sections || parsedContent.sections.length === 0) {
                              console.log('Parsing failed, trying manual section extraction...');
                              parsedContent = manualSectionExtraction(reportData.sectional_report);
                              console.log('Manual extraction result:', parsedContent);
                            }
                            
                            // Additional fallback: if still no sections, create sections from sections_generated
                            if (!parsedContent.sections || parsedContent.sections.length === 0) {
                              console.log('Still no sections found, creating from sections_generated...');
                              const sectionsFromGenerated = (reportData.sections_generated || []).map(sectionKey => ({
                                title: sectionKey,
                                content: reportData.sectional_report || ''
                              }));
                              parsedContent = { sections: sectionsFromGenerated };
                              console.log('Created sections from sections_generated:', sectionsFromGenerated);
                            }
                            
                            const sectionsData = parsedContent.sections;
                            
                            return (
                               <Box>
                                 {/* Display All 5 Sections */}
                                 <Box sx={{ mb: 2 }}>
                                   <Typography variant="subtitle2" gutterBottom>
                                     All 5 Report Sections ({sectionsData.length})
                                   </Typography>
                                   {sectionsData.map((section, index) => (
                                     <Accordion key={index} sx={{ mb: 1 }}>
                                       <AccordionSummary expandIcon={<ExpandMore />}>
                                         <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                           {index + 1}. {formatSectionTitle(section.title)}
                                         </Typography>
                                       </AccordionSummary>
                                       <AccordionDetails>
                                         <Box>
                                           {/* Section Summary */}
                                           <Box sx={{ 
                                             backgroundColor: 'grey.50', 
                                             p: 2, 
                                             borderRadius: 1, 
                                             mb: 2,
                                             border: '1px solid',
                                             borderColor: 'grey.200'
                                           }}>
                                             <Typography variant="subtitle2" sx={{ 
                                               fontWeight: 600, 
                                               color: 'primary.main',
                                               mb: 1
                                             }}>
                                               Section Summary
                                             </Typography>
                                             <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                               This section contains {(() => {
                                                 const tables = parseTablesFromContent(section.content);
                                                 return tables.length;
                                               })()} data table{(() => {
                                                 const tables = parseTablesFromContent(section.content);
                                                 return tables.length !== 1 ? 's' : '';
                                               })()} with detailed information about {section.title.toLowerCase()}.
                                             </Typography>
                                           </Box>
                                           
                                           {/* Parse and display tables */}
                                           {(() => {
                                             const tables = parseTablesFromContent(section.content);
                                             
                                             // Debug logging for formulation analysis
                                             if (section.title === 'formulation_analysis') {
                                               console.log('=== FORMULATION ANALYSIS DEBUG ===');
                                               console.log('Section title:', section.title);
                                               console.log('Content length:', section.content.length);
                                               console.log('Content preview:', section.content.substring(0, 500));
                                               console.log('Tables found:', tables.length);
                                               tables.forEach((table, idx) => {
                                                 console.log(`Table ${idx + 1}:`, table.title, 'Headers:', table.headers.length, 'Rows:', table.rows.length);
                                               });
                                             }
                                             
                                             if (tables.length === 0) {
                                               return (
                                                 <Box sx={{ 
                                                   textAlign: 'center', 
                                                   py: 3,
                                                   color: 'text.secondary'
                                                 }}>
                                                   <Typography variant="body2">
                                                     No structured tables found in this section.
                                                   </Typography>
                                                 </Box>
                                               );
                                             }
                                             
                                             return tables.map((table, tableIndex) => (
                                               <Box key={tableIndex} sx={{ mb: 3 }}>
                                                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                   <Typography variant="subtitle2" sx={{ 
                                                   fontWeight: 600, 
                                                   color: 'primary.main',
                                                   display: 'flex',
                                                   alignItems: 'center',
                                                   gap: 1
                                                 }}>
                                                   📊 {table.title}
                                                 </Typography>
                                                   {table.headers.length > 4 && (
                                                     <Typography variant="caption" sx={{ 
                                                       color: 'text.secondary',
                                                       fontStyle: 'italic'
                                                     }}>
                                                       ← Scroll horizontally to see all columns →
                                                     </Typography>
                                                   )}
                                                 </Box>
                                                 <TableContainer component={Paper} variant="outlined" sx={{ 
                                                   mb: 2,
                                                   boxShadow: 2,
                                                   borderRadius: 2,
                                                   maxWidth: '100%',
                                                   overflowX: 'auto'
                                                 }}>
                                                   <Table size="small">
                                                     <TableHead>
                                                       <TableRow>
                                                         {table.headers.map((header, i) => (
                                                           <TableCell key={i} sx={{ 
                                                             fontWeight: 'bold', 
                                                             backgroundColor: 'primary.main',
                                                             color: 'white',
                                                             fontSize: '0.875rem',
                                                               textAlign: 'center',
                                                               minWidth: '120px',
                                                               maxWidth: '200px',
                                                               wordWrap: 'break-word'
                                                           }}>
                                                             {header}
                                                           </TableCell>
                                                         ))}
                                                       </TableRow>
                                                     </TableHead>
                                                     <TableBody>
                                                       {table.rows.map((row, i) => (
                                                         <TableRow key={i} sx={{ 
                                                           backgroundColor: i % 2 === 0 ? 'grey.50' : 'white',
                                                           '&:hover': { backgroundColor: 'grey.100' },
                                                           transition: 'background-color 0.2s'
                                                         }}>
                                                           {row.map((cell, j) => {
                                                             console.log(`Rendering cell [${i}][${j}]:`, cell, 'Type:', typeof cell, 'Is empty:', cell === '');
                                                             return (
                                                             <TableCell key={j} sx={{ 
                                                               fontSize: '0.875rem',
                                                               borderRight: j < row.length - 1 ? '1px solid #e0e0e0' : 'none',
                                                               verticalAlign: 'top',
                                                               p: 1.5,
                                                               minWidth: '120px',
                                                               maxWidth: '200px',
                                                               wordWrap: 'break-word',
                                                               whiteSpace: 'pre-wrap'
                                                             }}>
                                                               <Box>
                                                                 <Box
                                                                   sx={{
                                                                     '& a': {
                                                                       color: 'primary.main',
                                                                       textDecoration: 'none',
                                                                       '&:hover': { textDecoration: 'underline' }
                                                                     }
                                                                   }}
                                                                   dangerouslySetInnerHTML={{
                                                                     __html: processMarkdown(typeof cell === 'string' ? (cell || '') : (cell.content || cell || ''))
                                                                   }}
                                                                 />
                                                                 {cell && typeof cell === 'object' && cell.source && (
                                                                   <Box sx={{ 
                                                                     backgroundColor: 'primary.50',
                                                                     p: 0.5,
                                                                     borderRadius: 0.5,
                                                                     border: '1px solid',
                                                                     borderColor: 'primary.200',
                                                                     mt: 0.5
                                                                   }}>
                                                                     <Typography variant="caption" sx={{ 
                                                                       color: 'primary.main',
                                                                       fontSize: '0.75rem',
                                                                       display: 'block',
                                                                       cursor: 'pointer',
                                                                       '&:hover': { textDecoration: 'underline' }
                                                                     }}
                                                                     onClick={() => {
                                                                       if (cell && typeof cell === 'object' && cell.source && cell.source.startsWith('http')) {
                                                                         window.open(cell.source, '_blank');
                                                                       }
                                                                     }}>
                                                                       🔗 Source: {cell && typeof cell === 'object' && cell.source ? (cell.source.length > 50 ? cell.source.substring(0, 50) + '...' : cell.source) : ''}
                                                                     </Typography>
                                                                   </Box>
                                                                 )}
                                                               </Box>
                                                             </TableCell>
                                                           );
                                                           })}
                                                         </TableRow>
                                                       ))}
                                                     </TableBody>
                                                   </Table>
                                                 </TableContainer>
                                                 
                                                                                                   {/* Table Summary Section - Display all summaries below the table */}
                                                  {(() => {
                                                    const tableSummaries = table.rows.flatMap(row => 
                                                      row.filter(cell => typeof cell === 'object' && cell.summary).map(cell => ({
                                                        summary: cell.summary,
                                                        source: cell.source
                                                      }))
                                                    );
                                                    
                                                    if (tableSummaries.length > 0) {
                                                      return (
                                                        <Box sx={{ 
                                                          backgroundColor: 'grey.50', 
                                                          p: 2, 
                                                          borderRadius: 1, 
                                                          border: '1px solid',
                                                          borderColor: 'grey.200',
                                                          mt: 1
                                                        }}>
                                                          <Typography variant="subtitle2" sx={{ 
                                                            fontWeight: 600, 
                                                            color: 'primary.main',
                                                            mb: 1
                                                          }}>
                                                            Table Summary
                                                          </Typography>
                                                          {tableSummaries.map((item, idx) => (
                                                            <Box key={idx} sx={{ mb: 1, pl: 1 }}>
                                                              <Box 
                                                                sx={{ 
                                                                color: 'text.secondary',
                                                                lineHeight: 1.4,
                                                                  mb: 0.5,
                                                                  '& strong': { fontWeight: 600, color: 'text.primary' },
                                                                  '& em': { fontStyle: 'italic' },
                                                                  '& a': { 
                                                                    color: 'primary.main', 
                                                                    textDecoration: 'none',
                                                                    '&:hover': { textDecoration: 'underline' }
                                                                  }
                                                                }}
                                                                dangerouslySetInnerHTML={{ 
                                                                  __html: `• ${processMarkdown(item.summary)}` 
                                                                }}
                                                              />
                                                              {item.source && (
                                                                <Box 
                                                                  sx={{ 
                                                                  color: 'primary.main',
                                                                  fontSize: '0.7rem',
                                                                  display: 'block',
                                                                  ml: 2,
                                                                  cursor: 'pointer',
                                                                    '&:hover': { textDecoration: 'underline' },
                                                                    '& a': { 
                                                                      color: 'primary.main', 
                                                                      textDecoration: 'none',
                                                                  '&:hover': { textDecoration: 'underline' }
                                                                    }
                                                                  }}
                                                                  dangerouslySetInnerHTML={{ 
                                                                    __html: `Source: ${processMarkdown(item.source.length > 50 ? item.source.substring(0, 50) + '...' : item.source)}` 
                                                                }}
                                                                onClick={() => {
                                                                  if (item.source.startsWith('http')) {
                                                                    window.open(item.source, '_blank');
                                                                  }
                                                                  }}
                                                                />
                                                              )}
                                                            </Box>
                                                          ))}
                                                        </Box>
                                                      );
                                                    }
                                                    return null;
                                                  })()}
                                                  
                                                  {/* Additional Table Context - Display relevant concluding text for this specific table */}
                                                  {(() => {
                                                    // Extract the concluding text content that should be distributed
                                                    const concludingContent = extractConcludingContent(section.content);
                                                    if (concludingContent && tableIndex < concludingContent.length) {
                                                      const tableContext = concludingContent[tableIndex];
                                                      if (tableContext && tableContext.trim()) {
                                                        return (
                                                          <Box sx={{ 
                                                            backgroundColor: 'blue.50', 
                                                            p: 2, 
                                                            borderRadius: 1, 
                                                            border: '1px solid',
                                                            borderColor: 'blue.200',
                                                            mt: 1
                                                          }}>
                                                            <Typography variant="subtitle2" sx={{ 
                                                              fontWeight: 600, 
                                                              color: 'blue.main',
                                                              mb: 1
                                                            }}>
                                                              Additional Context
                                                            </Typography>
                                                            <Box 
                                                              sx={{ 
                                                              color: 'text.secondary',
                                                              lineHeight: 1.6,
                                                                '& strong': { fontWeight: 600, color: 'text.primary' },
                                                                '& em': { fontStyle: 'italic' },
                                                                '& a': { 
                                                                  color: 'primary.main', 
                                                                  textDecoration: 'none',
                                                                  '&:hover': { textDecoration: 'underline' }
                                                                },
                                                                '& hr': { 
                                                                  border: 'none', 
                                                                  borderTop: '1px solid #e0e0e0', 
                                                                  margin: '1rem 0' 
                                                                },
                                                                '& h1, & h2, & h3': {
                                                                  fontFamily: 'inherit',
                                                                  lineHeight: 1.2
                                                                },
                                                                '& p': {
                                                                  margin: '0.5rem 0',
                                                                  lineHeight: 1.6
                                                                }
                                                              }}
                                                              dangerouslySetInnerHTML={{ 
                                                                __html: processMarkdown(tableContext) 
                                                              }}
                                                            />
                                                          </Box>
                                                        );
                                                      }
                                                    }
                                                    return null;
                                                  })()}
                                               </Box>
                                             ));
                                           })()}
                                           
                                                                                       {/* Display remaining text content (non-table) - excluding concluding content that's now distributed */}
                                            {(() => {
                                              const nonTableContent = extractNonTableContent(section.content);
                                              const concludingContent = extractConcludingContent(section.content);
                                              
                                              // Filter out concluding content that's now distributed across tables
                                              let filteredContent = nonTableContent;
                                              if (concludingContent.length > 0) {
                                                // Remove concluding content from the remaining text
                                                concludingContent.forEach(chunk => {
                                                  filteredContent = filteredContent.replace(chunk, '').trim();
                                                });
                                              }
                                              
                                              // Additional filtering for summary-like content
                                              filteredContent = filteredContent
                                                .split('\n')
                                                .filter(line => {
                                                  const trimmed = line.trim();
                                                  // Skip lines that look like summaries or conclusions
                                                  return !trimmed.match(/^(Summary|Conclusion|Note|•|-\s)/i) && 
                                                         trimmed.length > 0;
                                                })
                                                .join('\n');
                                              
                                              if (filteredContent.trim()) {
                                                return (
                                                  <Box sx={{ mt: 2 }}>
                                                    <Box 
                                                      sx={{ 
                                                      lineHeight: 1.6,
                                                        color: 'text.secondary',
                                                        '& strong': { fontWeight: 600, color: 'text.primary' },
                                                        '& em': { fontStyle: 'italic' },
                                                        '& a': { 
                                                          color: 'primary.main', 
                                                          textDecoration: 'none',
                                                          '&:hover': { textDecoration: 'underline' }
                                                        },
                                                        '& hr': { 
                                                          border: 'none', 
                                                          borderTop: '1px solid #e0e0e0', 
                                                          margin: '1rem 0' 
                                                        },
                                                        '& h1, & h2, & h3': {
                                                          fontFamily: 'inherit',
                                                          lineHeight: 1.2
                                                        },
                                                        '& p': {
                                                          margin: '0.5rem 0',
                                                          lineHeight: 1.6
                                                        }
                                                      }}
                                                      dangerouslySetInnerHTML={{ 
                                                        __html: processMarkdown(filteredContent) 
                                                      }}
                                                    />
                                                  </Box>
                                                );
                                              }
                                              return null;
                                            })()}
                                         </Box>
                                       </AccordionDetails>
                                     </Accordion>
                                   ))}
                                 </Box>
                               </Box>
                             );
                           } catch (error) {
                             console.error('Error processing report content:', error);
                             // Fallback to raw text if processing fails
                             return (
                               <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                 {reportData.sectional_report || 'Error processing report content'}
                               </Typography>
                             );
                           }
                         })()}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
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
