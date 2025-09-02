/**
 * Source Parser Utility
 * Handles parsing of markdown links and source attribution in table cells
 */

/**
 * Parse markdown link format: [text](url#section)
 * @param {string} cellContent - The cell content that may contain markdown links
 * @returns {Object} - Parsed content with text and source information
 */
export const parseMarkdownLink = (cellContent) => {
  if (!cellContent || typeof cellContent !== 'string') {
    return {
      text: cellContent,
      sourceUrl: null,
      sectionId: null,
      hasSource: false,
      isClickable: false,
      displayText: cellContent
    };
  }

  // Match markdown link pattern: [text](url#section)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...cellContent.matchAll(markdownLinkRegex)];

  if (matches.length === 0) {
    return {
      text: cellContent,
      sourceUrl: null,
      sectionId: null,
      hasSource: false,
      isClickable: false,
      displayText: cellContent
    };
  }

  // Handle multiple sources in one cell (e.g., [Data](URL1#section1) + [URL2#section2])
  if (matches.length > 1) {
    const sources = matches.map(match => {
      const text = match[1];
      const url = match[2];
      const [baseUrl, sectionId] = url.split('#');
      
      return {
        text: text,
        sourceUrl: baseUrl,
        sectionId: sectionId || null,
        fullUrl: url
      };
    });

    return {
      text: sources[0].text, // Use first source text as display text
      sourceUrl: sources[0].sourceUrl, // Use first source as primary
      sectionId: sources[0].sectionId,
      hasSource: true,
      isClickable: true,
      fullUrl: sources[0].fullUrl,
      multipleSources: sources,
      displayText: `${sources[0].text} (${sources.length} sources)`
    };
  }

  // Single source
  const match = matches[0];
  const text = match[1];
  const url = match[2];

  // Split URL and section ID
  const [baseUrl, sectionId] = url.split('#');

  return {
    text: text,
    sourceUrl: baseUrl,
    sectionId: sectionId || null,
    hasSource: true,
    isClickable: true,
    fullUrl: url,
    displayText: text
  };
};

/**
 * Parse a table cell and extract source information
 * @param {string} cellContent - The raw cell content
 * @returns {Object} - Parsed cell with source information
 */
export const parseTableCell = (cellContent) => {
  const parsed = parseMarkdownLink(cellContent);
  
  return {
    ...parsed,
    displayText: parsed.displayText || parsed.text || cellContent,
    isClickable: parsed.hasSource && parsed.sourceUrl
  };
};

/**
 * Generate a source highlighting URL
 * @param {string} sourceUrl - The base source URL
 * @param {string} sectionId - The section identifier
 * @returns {string} - URL with highlighting parameters
 */
export const generateHighlightUrl = (sourceUrl, sectionId) => {
  if (!sourceUrl) return null;

  try {
    const url = new URL(sourceUrl);
    
    // Add section identifier if available
    if (sectionId) {
      url.hash = sectionId;
    }

    // Add highlighting parameter as search parameter
    url.searchParams.set('highlight', 'true');
    
    // Add timestamp to prevent caching issues
    url.searchParams.set('_t', Date.now());

    return url.toString();
  } catch (error) {
    console.error('Error generating highlight URL:', error);
    // Fallback: manually construct URL
    let url = sourceUrl;
    if (sectionId) {
      url += `#${sectionId}`;
    }
    url += (url.includes('?') ? '&' : '?') + 'highlight=true';
    return url;
  }
};

/**
 * Extract all sources from a table
 * @param {Array} tableRows - Array of table rows
 * @returns {Array} - Array of unique sources
 */
export const extractSourcesFromTable = (tableRows) => {
  const sources = new Set();
  
  tableRows.forEach(row => {
    row.forEach(cell => {
      const parsed = parseMarkdownLink(cell);
      if (parsed.hasSource && parsed.sourceUrl) {
        try {
          sources.add({
            url: parsed.sourceUrl,
            domain: new URL(parsed.sourceUrl).hostname,
            sectionId: parsed.sectionId
          });
        } catch (error) {
          console.warn('Invalid URL in cell:', parsed.sourceUrl);
        }
        
        // Add multiple sources if present
        if (parsed.multipleSources) {
          parsed.multipleSources.forEach(source => {
            try {
              sources.add({
                url: source.sourceUrl,
                domain: new URL(source.sourceUrl).hostname,
                sectionId: source.sectionId
              });
            } catch (error) {
              console.warn('Invalid URL in multiple sources:', source.sourceUrl);
            }
          });
        }
      }
    });
  });

  return Array.from(sources);
};

/**
 * Validate if a URL is from an authoritative source
 * @param {string} url - The URL to validate
 * @returns {boolean} - Whether the URL is from an authoritative source
 */
export const isAuthoritativeSource = (url) => {
  if (!url) return false;
  
  const authoritativeDomains = [
    'fda.gov',
    'ema.europa.eu',
    'clinicaltrials.gov',
    'pubmed.ncbi.nlm.nih.gov',
    'ncbi.nlm.nih.gov',
    'researchandmarkets.com',
    'patents.google.com',
    'uspto.gov',
    'epo.org',
    'wipo.int',
    'dailymed.nlm.nih.gov',
    'rxlist.com',
    'drugs.com',
    'medicines.org.uk',
    'pfizer.com',
    'gsk.com',
    'novartis.com',
    'johnsonandjohnson.com',
    'merck.com',
    'roche.com',
    'sanofi.com',
    'astrazeneca.com',
    'bms.com',
    'amgen.com',
    'biogen.com',
    'regeneron.com',
    'gilead.com'
  ];

  try {
    const domain = new URL(url).hostname.toLowerCase();
    return authoritativeDomains.some(authDomain => domain.includes(authDomain));
  } catch (error) {
    console.warn('Error validating authoritative source:', error);
    return false;
  }
};

/**
 * Get source domain name for display
 * @param {string} url - The source URL
 * @returns {string} - Display name for the source
 */
export const getSourceDisplayName = (url) => {
  if (!url) return 'Unknown Source';
  
  try {
    const domain = new URL(url).hostname.toLowerCase();
    
    const sourceNames = {
      'fda.gov': 'FDA',
      'ema.europa.eu': 'EMA',
      'clinicaltrials.gov': 'ClinicalTrials.gov',
      'pubmed.ncbi.nlm.nih.gov': 'PubMed',
      'ncbi.nlm.nih.gov': 'NCBI',
      'researchandmarkets.com': 'Research and Markets',
      'patents.google.com': 'Google Patents',
      'uspto.gov': 'USPTO',
      'epo.org': 'EPO',
      'wipo.int': 'WIPO',
      'dailymed.nlm.nih.gov': 'DailyMed',
      'rxlist.com': 'RxList',
      'drugs.com': 'Drugs.com',
      'medicines.org.uk': 'Medicines.org.uk',
      'pfizer.com': 'Pfizer',
      'gsk.com': 'GSK',
      'novartis.com': 'Novartis',
      'johnsonandjohnson.com': 'Johnson & Johnson',
      'merck.com': 'Merck',
      'roche.com': 'Roche',
      'sanofi.com': 'Sanofi',
      'astrazeneca.com': 'AstraZeneca',
      'bms.com': 'Bristol-Myers Squibb',
      'amgen.com': 'Amgen',
      'biogen.com': 'Biogen',
      'regeneron.com': 'Regeneron',
      'gilead.com': 'Gilead'
    };

    for (const [key, name] of Object.entries(sourceNames)) {
      if (domain.includes(key)) {
        return name;
      }
    }

    return domain.replace('www.', '');
  } catch (error) {
    console.warn('Error getting source display name:', error);
    return 'Unknown Source';
  }
};

/**
 * Clean markdown formatting from text
 * @param {string} text - Text that may contain markdown formatting
 * @returns {string} - Clean text without markdown
 */
export const cleanMarkdown = (text) => {
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

/**
 * Check if cell content contains clickable links
 * @param {string} cellContent - The cell content to check
 * @returns {boolean} - Whether the cell contains clickable links
 */
export const hasClickableLinks = (cellContent) => {
  if (!cellContent || typeof cellContent !== 'string') return false;
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  return markdownLinkRegex.test(cellContent);
};

/**
 * Get all URLs from a cell content
 * @param {string} cellContent - The cell content to extract URLs from
 * @returns {Array} - Array of URLs found in the cell
 */
export const extractUrlsFromCell = (cellContent) => {
  if (!cellContent || typeof cellContent !== 'string') return [];
  
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...cellContent.matchAll(markdownLinkRegex)];
  
  return matches.map(match => {
    const url = match[2];
    const [baseUrl, sectionId] = url.split('#');
    return {
      fullUrl: url,
      baseUrl: baseUrl,
      sectionId: sectionId || null,
      text: match[1]
    };
  });
};
