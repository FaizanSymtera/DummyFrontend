/**
 * Markdown Parser Utility
 * Converts markdown content into structured table data for clickable navigation
 */

/**
 * Ultra-robust table parser that handles various edge cases
 * @param {string} markdownContent - Raw markdown content
 * @returns {Array} - Array of parsed tables
 */
export const parseMarkdownToTables = (markdownContent) => {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return [];
  }

  console.log('=== ULTRA-ROBUST TABLE PARSING ===');
  console.log('Content length:', markdownContent.length);
  console.log('Content preview:', markdownContent.substring(0, 500));

  const tables = [];
  const lines = markdownContent.split('\n');
  let currentTable = null;
  let inTable = false;
  let currentSectionTitle = '';
  let consecutiveEmptyLines = 0;
  let tableStartIndex = -1;

  // Helper function to clean and validate table row
  const cleanTableRow = (line) => {
    // Remove leading/trailing whitespace
    let cleaned = line.trim();
    
    // Ensure line starts and ends with pipe
    if (!cleaned.startsWith('|')) {
      cleaned = '|' + cleaned;
    }
    if (!cleaned.endsWith('|')) {
      cleaned = cleaned + '|';
    }
    
    // Split by pipes and clean each cell
    const cells = cleaned.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    
    return cells;
  };

  // Helper function to detect if line is a table separator
  const isTableSeparator = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
    
    const parts = trimmed.split('|').map(part => part.trim());
    return parts.every(part => part === '' || part.match(/^-+$/));
  };

  // Helper function to detect if line is a table row
  const isTableRow = (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
    
    const pipeCount = (trimmed.match(/\|/g) || []).length;
    return pipeCount >= 3; // At least 3 pipes for a valid table row
  };

  // Helper function to detect section headers
  const isSectionHeader = (line) => {
    const trimmed = line.trim();
    return (
      (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
      /^\d+\.\s+\*\*.*\*\*/.test(trimmed) ||
      /^#+\s+/.test(trimmed)
    );
  };

  // Helper function to extract section title
  const extractSectionTitle = (line) => {
    const trimmed = line.trim();
    
    // Remove markdown formatting
    let title = trimmed
      .replace(/^\d+\.\s+/, '') // Remove numbered prefix
      .replace(/^#+\s+/, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold formatting
      .trim();
    
    return title;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    console.log(`Line ${i}: "${trimmed}"`);
    
    // Handle empty lines
    if (trimmed === '') {
      consecutiveEmptyLines++;
      // End table after 2 consecutive empty lines
      if (inTable && currentTable && currentTable.headers.length > 0 && consecutiveEmptyLines >= 2) {
        console.log(`Completing table due to empty lines: "${currentTable.title}" with ${currentTable.rows.length} rows`);
        tables.push(currentTable);
        inTable = false;
        currentTable = null;
        consecutiveEmptyLines = 0;
      }
      continue;
    } else {
      consecutiveEmptyLines = 0;
    }
    
    // Check for section headers
    if (isSectionHeader(trimmed)) {
      const title = extractSectionTitle(trimmed);
      console.log(`Found section header: "${title}"`);
      
      // End current table if we're in one
      if (inTable && currentTable && currentTable.headers.length > 0) {
        console.log(`Completing table due to new section: "${currentTable.title}" with ${currentTable.rows.length} rows`);
        tables.push(currentTable);
      }
      
      currentSectionTitle = title;
      inTable = false;
      currentTable = null;
      continue;
    }
    
    // Check for table separator
    if (isTableSeparator(trimmed)) {
      console.log(`Found table separator at line ${i}`);
      continue;
    }
    
    // Check for table row
    if (isTableRow(trimmed)) {
      if (!inTable) {
        // Start new table
        inTable = true;
        tableStartIndex = i;
        currentTable = {
          title: currentSectionTitle || `Table ${tables.length + 1}`,
          headers: [],
          rows: []
        };
        console.log(`Starting new table at line ${i}: "${currentTable.title}"`);
      }
      
      // Parse table row
      const cells = cleanTableRow(trimmed);
      console.log(`Parsed cells: ${cells.length}`, cells);
      
      if (currentTable.headers.length === 0) {
        // This is the header row
        currentTable.headers = cells;
        console.log(`Set headers: ${cells.length} columns`);
      } else {
        // This is a data row
        if (cells.length > 0) {
          // Ensure row has same number of columns as headers
          const paddedCells = [...cells];
          while (paddedCells.length < currentTable.headers.length) {
            paddedCells.push('No data available');
          }
          currentTable.rows.push(paddedCells.slice(0, currentTable.headers.length));
          console.log(`Added row ${currentTable.rows.length}: ${paddedCells.length} cells`);
        }
      }
    } else {
      // Non-table content - end current table if we're in one
      if (inTable && currentTable && currentTable.headers.length > 0) {
        console.log(`Completing table due to non-table content: "${currentTable.title}" with ${currentTable.rows.length} rows`);
        tables.push(currentTable);
        inTable = false;
        currentTable = null;
      }
    }
  }
  
  // Don't forget to add the last table if we're still in one
  if (inTable && currentTable && currentTable.headers.length > 0) {
    console.log(`Completing final table: "${currentTable.title}" with ${currentTable.rows.length} rows`);
    tables.push(currentTable);
  }

  console.log(`Total tables parsed: ${tables.length}`);
  tables.forEach((table, index) => {
    console.log(`Table ${index + 1}: "${table.title}" - ${table.headers.length} headers, ${table.rows.length} rows`);
  });
  
  return tables;
};

/**
 * Fallback table parser for problematic content
 * @param {string} markdownContent - Raw markdown content
 * @returns {Array} - Array of parsed tables
 */
export const parseMarkdownToTablesFallback = (markdownContent) => {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return [];
  }

  console.log('=== FALLBACK TABLE PARSING ===');
  
  const tables = [];
  const lines = markdownContent.split('\n');
  let currentTable = null;
  let currentSectionTitle = '';
  
  // Look for any content that looks like a table
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for section headers
    if (line.startsWith('**') && line.endsWith('**')) {
      currentSectionTitle = line.replace(/\*\*/g, '').trim();
      continue;
    }
    
    // Look for lines with multiple pipe characters
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2) {
      if (!currentTable) {
        currentTable = {
          title: currentSectionTitle || `Table ${tables.length + 1}`,
          headers: [],
          rows: []
        };
      }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 1) {
        if (currentTable.headers.length === 0) {
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }
      }
    } else if (currentTable && currentTable.headers.length > 0) {
      // End current table
      if (currentTable.rows.length > 0) {
        tables.push(currentTable);
      }
      currentTable = null;
    }
  }
  
  // Add final table if exists
  if (currentTable && currentTable.headers.length > 0 && currentTable.rows.length > 0) {
    tables.push(currentTable);
  }
  
  console.log(`Fallback parsing found ${tables.length} tables`);
  return tables;
};

/**
 * Enhanced table parsing with multiple strategies
 * @param {string} markdownContent - Raw markdown content
 * @returns {Array} - Array of parsed tables
 */
export const parseMarkdownToTablesEnhanced = (markdownContent) => {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return [];
  }

  console.log('=== ENHANCED MULTI-STRATEGY TABLE PARSING ===');
  
  // Strategy 1: Ultra-robust parsing
  let tables = parseMarkdownToTables(markdownContent);
  if (tables.length > 0) {
    console.log(`Strategy 1 found ${tables.length} tables`);
    return tables;
  }
  
  // Strategy 2: Fallback parsing
  console.log('Trying Strategy 2: Fallback parsing...');
  tables = parseMarkdownToTablesFallback(markdownContent);
  if (tables.length > 0) {
    console.log(`Strategy 2 found ${tables.length} tables`);
    return tables;
  }
  
  // Strategy 3: Aggressive parsing
  console.log('Trying Strategy 3: Aggressive parsing...');
  const lines = markdownContent.split('\n');
  const potentialTables = [];
  let currentTable = null;
  let currentSectionTitle = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for section headers
    if (line.startsWith('**') && line.endsWith('**')) {
      currentSectionTitle = line.replace(/\*\*/g, '').trim();
      if (currentTable && currentTable.headers.length > 0) {
        potentialTables.push(currentTable);
      }
      currentTable = null;
      continue;
    }
    
    // Look for any line with pipe characters
    if (line.includes('|')) {
      if (!currentTable) {
        currentTable = {
          title: currentSectionTitle || `Table ${potentialTables.length + 1}`,
          headers: [],
          rows: []
        };
      }
      
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 1) {
        if (currentTable.headers.length === 0) {
          currentTable.headers = cells;
        } else {
          currentTable.rows.push(cells);
        }
      }
    } else if (currentTable && currentTable.headers.length > 0) {
      // End current table
      if (currentTable.rows.length > 0) {
        potentialTables.push(currentTable);
      }
      currentTable = null;
    }
  }
  
  // Add final table if exists
  if (currentTable && currentTable.headers.length > 0 && currentTable.rows.length > 0) {
    potentialTables.push(currentTable);
  }
  
  console.log(`Strategy 3 found ${potentialTables.length} potential tables`);
  return potentialTables;
};

/**
 * Extract markdown links from text
 * @param {string} text - Text that may contain markdown links
 * @returns {Array} - Array of extracted links
 */
export const extractMarkdownLinks = (text) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...text.matchAll(markdownLinkRegex)];
  
  return matches.map(match => ({
    text: match[1],
    url: match[2],
    fullMatch: match[0]
  }));
};

/**
 * Check if text contains markdown links
 * @param {string} text - Text to check
 * @returns {boolean} - Whether text contains markdown links
 */
export const hasMarkdownLinks = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return markdownLinkRegex.test(text);
};

/**
 * Convert markdown content to structured data
 * @param {string} markdownContent - Raw markdown content
 * @returns {Object} - Structured data with tables and raw content
 */
export const convertMarkdownToStructuredData = (markdownContent) => {
  console.log('=== ENHANCED MARKDOWN PARSING DEBUG ===');
  console.log('Input content length:', markdownContent.length);
  
  // Try enhanced parsing first
  let tables = parseMarkdownToTablesEnhanced(markdownContent);
  
  // If no tables found, try the original method as fallback
  if (tables.length === 0) {
    console.log('Enhanced parsing found no tables, trying original method...');
    tables = parseMarkdownToTables(markdownContent);
  }
  
  console.log('Final parsed tables count:', tables.length);
  tables.forEach((table, index) => {
    console.log(`Table ${index + 1}: "${table.title}" - Headers: ${table.headers.length}, Rows: ${table.rows.length}`);
  });
  
  return {
    success: true,
    tables: tables,
    report: markdownContent,
    hasTables: tables.length > 0,
    tableCount: tables.length
  };
};

/**
 * Analyze markdown content for clickable elements
 * @param {string} markdownContent - Raw markdown content
 * @returns {Object} - Analysis results
 */
export const analyzeMarkdownContent = (markdownContent) => {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return {
      hasContent: false,
      hasLinks: false,
      linkCount: 0,
      tables: [],
      links: []
    };
  }

  const tables = parseMarkdownToTables(markdownContent);
  const allLinks = extractMarkdownLinks(markdownContent);
  
  return {
    hasContent: true,
    hasLinks: allLinks.length > 0,
    linkCount: allLinks.length,
    tables: tables,
    links: allLinks,
    tableCount: tables.length
  };
};

/**
 * Test function to debug table parsing issues
 * @param {string} markdownContent - Raw markdown content
 * @returns {Object} - Debug information
 */
export const debugTableParsing = (markdownContent) => {
  if (!markdownContent || typeof markdownContent !== 'string') {
    return { error: 'Invalid content' };
  }

  const lines = markdownContent.split('\n');
  const debugInfo = {
    totalLines: lines.length,
    contentLength: markdownContent.length,
    linesWithPipes: [],
    sectionHeaders: [],
    tableSeparators: [],
    potentialTableRows: []
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('|')) {
      debugInfo.linesWithPipes.push({ line: i + 1, content: line });
    }
    
    if (line.startsWith('**') && line.endsWith('**')) {
      debugInfo.sectionHeaders.push({ line: i + 1, content: line });
    }
    
    if (line.includes('---') && line.includes('|')) {
      debugInfo.tableSeparators.push({ line: i + 1, content: line });
    }
    
    const pipeCount = (line.match(/\|/g) || []).length;
    if (pipeCount >= 2) {
      debugInfo.potentialTableRows.push({ line: i + 1, content: line, pipeCount });
    }
  }

  return debugInfo;
};

export default {
  parseMarkdownToTables,
  parseMarkdownToTablesFallback,
  parseMarkdownToTablesEnhanced,
  extractMarkdownLinks,
  hasMarkdownLinks,
  convertMarkdownToStructuredData,
  analyzeMarkdownContent,
  debugTableParsing
};
