/**
 * Debug Utilities for Source Navigation
 * Helps identify and debug issues with clickable navigation
 */

/**
 * Debug table data to check for clickable links
 * @param {Array} tableRows - Array of table rows
 * @returns {Object} - Debug information about the table
 */
export const debugTableData = (tableRows) => {
  const debugInfo = {
    totalRows: tableRows.length,
    totalCells: 0,
    clickableCells: 0,
    clickableCellsDetails: [],
    errors: []
  };

  try {
    tableRows.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        debugInfo.errors.push(`Row ${rowIndex} is not an array: ${typeof row}`);
        return;
      }

      row.forEach((cell, cellIndex) => {
        debugInfo.totalCells++;
        
        if (typeof cell === 'string') {
          // Check if cell contains markdown links
          const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          const matches = [...cell.matchAll(markdownLinkRegex)];
          
          if (matches.length > 0) {
            debugInfo.clickableCells++;
            debugInfo.clickableCellsDetails.push({
              row: rowIndex,
              cell: cellIndex,
              content: cell,
              matches: matches.length,
              firstMatch: matches[0] ? {
                text: matches[0][1],
                url: matches[0][2]
              } : null
            });
          }
        } else {
          debugInfo.errors.push(`Cell ${rowIndex}:${cellIndex} is not a string: ${typeof cell}`);
        }
      });
    });
  } catch (error) {
    debugInfo.errors.push(`Error analyzing table data: ${error.message}`);
  }

  return debugInfo;
};

/**
 * Test markdown link parsing
 * @param {string} content - Content to test
 * @returns {Object} - Test results
 */
export const testMarkdownParsing = (content) => {
  const result = {
    input: content,
    hasMarkdownLinks: false,
    parsedLinks: [],
    errors: []
  };

  try {
    if (typeof content !== 'string') {
      result.errors.push('Content is not a string');
      return result;
    }

    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(markdownLinkRegex)];
    
    result.hasMarkdownLinks = matches.length > 0;
    result.parsedLinks = matches.map((match, index) => ({
      index,
      text: match[1],
      url: match[2],
      fullMatch: match[0]
    }));

  } catch (error) {
    result.errors.push(`Error parsing markdown: ${error.message}`);
  }

  return result;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result
 */
export const validateUrl = (url) => {
  const result = {
    url,
    isValid: false,
    error: null,
    parsed: null
  };

  try {
    const urlObj = new URL(url);
    result.isValid = true;
    result.parsed = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash
    };
  } catch (error) {
    result.error = error.message;
  }

  return result;
};

/**
 * Log debug information to console
 * @param {string} label - Label for the debug info
 * @param {any} data - Data to log
 * @param {boolean} detailed - Whether to log detailed information
 */
export const logDebug = (label, data, detailed = false) => {
  console.group(`🔍 Debug: ${label}`);
  
  if (detailed) {
    console.log('Full data:', data);
  } else {
    console.log('Summary:', data);
  }
  
  if (data.errors && data.errors.length > 0) {
    console.warn('Errors found:', data.errors);
  }
  
  console.groupEnd();
};

/**
 * Check if the current environment supports debugging
 * @returns {boolean} - Whether debugging is enabled
 */
export const isDebugEnabled = () => {
  return process.env.NODE_ENV === 'development' || 
         window.location.search.includes('debug=true') ||
         localStorage.getItem('debug-enabled') === 'true';
};

/**
 * Enable/disable debugging
 * @param {boolean} enabled - Whether to enable debugging
 */
export const setDebugEnabled = (enabled) => {
  if (enabled) {
    localStorage.setItem('debug-enabled', 'true');
    console.log('🔍 Debug mode enabled');
  } else {
    localStorage.removeItem('debug-enabled');
    console.log('🔍 Debug mode disabled');
  }
};

/**
 * Debug clickable cell detection
 * @param {string} cellContent - Cell content to debug
 * @returns {Object} - Debug information
 */
export const debugClickableCell = (cellContent) => {
  const result = {
    cellContent,
    isClickable: false,
    parsingResult: null,
    validationResult: null,
    errors: []
  };

  try {
    // Import the parsing function dynamically to avoid circular dependencies
    const { parseTableCell } = require('./sourceParser');
    const parsed = parseTableCell(cellContent);
    
    result.parsingResult = parsed;
    result.isClickable = parsed.isClickable;

    if (parsed.sourceUrl) {
      result.validationResult = validateUrl(parsed.sourceUrl);
    }

  } catch (error) {
    result.errors.push(`Error debugging cell: ${error.message}`);
  }

  return result;
};

/**
 * Generate a debug report for the entire application
 * @returns {Object} - Debug report
 */
export const generateDebugReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      debugEnabled: isDebugEnabled()
    },
    localStorage: {
      debugEnabled: localStorage.getItem('debug-enabled')
    },
    console: {
      log: console.log,
      warn: console.warn,
      error: console.error
    }
  };

  return report;
};

export default {
  debugTableData,
  testMarkdownParsing,
  validateUrl,
  logDebug,
  isDebugEnabled,
  setDebugEnabled,
  debugClickableCell,
  generateDebugReport
};
