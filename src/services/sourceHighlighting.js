/**
 * Source Highlighting Service
 * Handles highlighting specific sections on source pages
 */

class SourceHighlightingService {
  constructor() {
    this.supportedDomains = {
      'fda.gov': this.highlightFDA,
      'clinicaltrials.gov': this.highlightClinicalTrials,
      'pubmed.ncbi.nlm.nih.gov': this.highlightPubMed,
      'ncbi.nlm.nih.gov': this.highlightPubMed,
      'ema.europa.eu': this.highlightEMA,
      'researchandmarkets.com': this.highlightResearchAndMarkets,
      'patents.google.com': this.highlightGooglePatents,
      'uspto.gov': this.highlightUSPTO,
      'epo.org': this.highlightEPO,
      'wipo.int': this.highlightWIPO,
      'dailymed.nlm.nih.gov': this.highlightDailyMed,
      'rxlist.com': this.highlightRxList,
      'drugs.com': this.highlightDrugsCom,
      'medicines.org.uk': this.highlightMedicinesUK
    };
  }

  /**
   * Check if a domain supports highlighting
   * @param {string} url - The URL to check
   * @returns {boolean} - Whether highlighting is supported
   */
  isHighlightingSupported(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return Object.keys(this.supportedDomains).some(supportedDomain => 
        domain.includes(supportedDomain)
      );
    } catch (error) {
      console.warn('Error checking highlighting support:', error);
      return false;
    }
  }

  /**
   * Get the appropriate highlighting function for a URL
   * @param {string} url - The URL to get highlighting function for
   * @returns {Function|null} - The highlighting function or null
   */
  getHighlightingFunction(url) {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      for (const [supportedDomain, highlightingFunction] of Object.entries(this.supportedDomains)) {
        if (domain.includes(supportedDomain)) {
          return highlightingFunction;
        }
      }
      return null;
    } catch (error) {
      console.warn('Error getting highlighting function:', error);
      return null;
    }
  }

  /**
   * Generate a URL with highlighting parameters
   * @param {string} baseUrl - The base URL
   * @param {string} sectionId - The section identifier
   * @returns {string} - URL with highlighting parameters
   */
  generateHighlightUrl(baseUrl, sectionId) {
    try {
      if (!baseUrl) {
        console.warn('No base URL provided for highlighting');
        return null;
      }

      const url = new URL(baseUrl);
      
      // Add section identifier if provided
      if (sectionId) {
        url.hash = sectionId;
      }

      // Add highlighting parameters based on domain
      const highlightingFunction = this.getHighlightingFunction(baseUrl);
      if (highlightingFunction) {
        return highlightingFunction.call(this, url.toString(), sectionId);
      }

      // Default highlighting for all sites
      url.searchParams.set('highlight', 'true');
      url.searchParams.set('_t', Date.now()); // Prevent caching
      
      return url.toString();
    } catch (error) {
      console.error('Error generating highlight URL:', error);
      // Fallback: manually construct URL
      try {
        let url = baseUrl;
        if (sectionId) {
          url += `#${sectionId}`;
        }
        url += (url.includes('?') ? '&' : '?') + 'highlight=true';
        return url;
      } catch (fallbackError) {
        console.error('Fallback URL generation failed:', fallbackError);
        return baseUrl;
      }
    }
  }

  /**
   * FDA.gov highlighting
   */
  highlightFDA(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting FDA URL:', error);
      return url;
    }
  }

  /**
   * ClinicalTrials.gov highlighting
   */
  highlightClinicalTrials(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting ClinicalTrials URL:', error);
      return url;
    }
  }

  /**
   * PubMed highlighting
   */
  highlightPubMed(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting PubMed URL:', error);
      return url;
    }
  }

  /**
   * EMA highlighting
   */
  highlightEMA(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting EMA URL:', error);
      return url;
    }
  }

  /**
   * Research and Markets highlighting
   */
  highlightResearchAndMarkets(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting Research and Markets URL:', error);
      return url;
    }
  }

  /**
   * Google Patents highlighting
   */
  highlightGooglePatents(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting Google Patents URL:', error);
      return url;
    }
  }

  /**
   * USPTO highlighting
   */
  highlightUSPTO(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting USPTO URL:', error);
      return url;
    }
  }

  /**
   * EPO highlighting
   */
  highlightEPO(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting EPO URL:', error);
      return url;
    }
  }

  /**
   * WIPO highlighting
   */
  highlightWIPO(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting WIPO URL:', error);
      return url;
    }
  }

  /**
   * DailyMed highlighting
   */
  highlightDailyMed(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting DailyMed URL:', error);
      return url;
    }
  }

  /**
   * RxList highlighting
   */
  highlightRxList(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting RxList URL:', error);
      return url;
    }
  }

  /**
   * Drugs.com highlighting
   */
  highlightDrugsCom(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting Drugs.com URL:', error);
      return url;
    }
  }

  /**
   * Medicines.org.uk highlighting
   */
  highlightMedicinesUK(url, sectionId) {
    try {
      const urlObj = new URL(url);
      if (sectionId) {
        urlObj.hash = sectionId;
      }
      urlObj.searchParams.set('highlight', 'true');
      return urlObj.toString();
    } catch (error) {
      console.warn('Error highlighting Medicines.org.uk URL:', error);
      return url;
    }
  }

  /**
   * Create a browser extension or bookmarklet for highlighting
   * This can be used to inject highlighting scripts into source pages
   */
  createHighlightingBookmarklet() {
    const script = `
      (function() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const shouldHighlight = urlParams.get('highlight');
        const sectionId = window.location.hash.substring(1);
        
        if (shouldHighlight && sectionId) {
          // Find the element with the section ID
          const element = document.getElementById(sectionId) || 
                         document.querySelector('[name="' + sectionId + '"]') ||
                         document.querySelector('[data-section="' + sectionId + '"]');
          
          if (element) {
            // Scroll to the element
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight the element
            element.style.backgroundColor = '#fff3cd';
            element.style.border = '2px solid #ffc107';
            element.style.borderRadius = '4px';
            element.style.padding = '8px';
            element.style.boxShadow = '0 0 10px rgba(255, 193, 7, 0.5)';
            
            // Remove highlighting after 5 seconds
            setTimeout(() => {
              element.style.backgroundColor = '';
              element.style.border = '';
              element.style.borderRadius = '';
              element.style.padding = '';
              element.style.boxShadow = '';
            }, 5000);
          }
        }
      })();
    `;
    
    return `javascript:${encodeURIComponent(script)}`;
  }

  /**
   * Check URL accessibility
   * @param {string} url - The URL to check
   * @returns {Object} - Accessibility information
   */
  checkUrlAccessibility(url) {
    try {
      if (!url) {
        return { accessible: false, type: 'error', reason: 'No URL provided' };
      }

      const domain = new URL(url).hostname.toLowerCase();

      // Sites that are generally accessible
      const accessibleSites = [
        'fda.gov',
        'clinicaltrials.gov',
        'pubmed.ncbi.nlm.nih.gov',
        'ncbi.nlm.nih.gov',
        'patents.google.com',
        'uspto.gov',
        'epo.org',
        'wipo.int',
        'dailymed.nlm.nih.gov',
        'rxlist.com',
        'drugs.com',
        'medicines.org.uk'
      ];

      // Sites that may require authentication or subscription
      const restrictedSites = [
        'researchandmarkets.com',
        'ema.europa.eu'
      ];

      // Sites that are likely to redirect to home pages
      const homePageRedirectSites = [
        'company.com',
        'pharma.com',
        'biotech.com'
      ];

      if (accessibleSites.some(site => domain.includes(site))) {
        return { accessible: true, type: 'accessible', reason: 'Generally accessible government/academic site' };
      } else if (restrictedSites.some(site => domain.includes(site))) {
        return { accessible: false, type: 'restricted', reason: 'May require authentication or subscription' };
      } else if (homePageRedirectSites.some(site => domain.includes(site))) {
        return { accessible: false, type: 'redirect', reason: 'Likely to redirect to home page' };
      } else {
        return { accessible: true, type: 'unknown', reason: 'Unknown accessibility status' };
      }
    } catch (error) {
      console.warn('Error checking URL accessibility:', error);
      return { accessible: false, type: 'error', reason: 'Invalid URL format' };
    }
  }

  /**
   * Get alternative search strategies for a URL
   * @param {string} url - The URL to get alternatives for
   * @param {string} sectionId - The section identifier
   * @returns {Array} - Array of alternative search strategies
   */
  getAlternativeStrategies(url, sectionId) {
    try {
      if (!url) return [];

      const domain = new URL(url).hostname.toLowerCase();
      const strategies = [];

      if (domain.includes('fda.gov')) {
        strategies.push({
          type: 'search',
          description: 'Search FDA.gov for the specific information',
          url: `https://www.fda.gov/search?s=${encodeURIComponent(sectionId || '')}`
        });
      } else if (domain.includes('clinicaltrials.gov')) {
        strategies.push({
          type: 'search',
          description: 'Search ClinicalTrials.gov for the trial',
          url: `https://clinicaltrials.gov/ct2/results?term=${encodeURIComponent(sectionId || '')}`
        });
      } else if (domain.includes('pubmed.ncbi.nlm.nih.gov')) {
        strategies.push({
          type: 'search',
          description: 'Search PubMed for the article',
          url: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(sectionId || '')}`
        });
      }

      // Generic search strategy
      strategies.push({
        type: 'google',
        description: 'Search Google for the information',
        url: `https://www.google.com/search?q=${encodeURIComponent((sectionId || '') + ' site:' + domain)}`
      });

      return strategies;
    } catch (error) {
      console.warn('Error getting alternative strategies:', error);
      return [];
    }
  }

  /**
   * Get highlighting instructions for a specific domain
   * @param {string} url - The URL to get instructions for
   * @returns {string} - Instructions for highlighting
   */
  getHighlightingInstructions(url) {
    try {
      if (!url) return 'No URL provided';

      const domain = new URL(url).hostname.toLowerCase();
      
      if (domain.includes('fda.gov')) {
        return 'FDA.gov supports automatic section highlighting. The relevant section will be highlighted when you visit the page.';
      } else if (domain.includes('clinicaltrials.gov')) {
        return 'ClinicalTrials.gov supports automatic section highlighting. The relevant section will be highlighted when you visit the page.';
      } else if (domain.includes('pubmed.ncbi.nlm.nih.gov')) {
        return 'PubMed supports automatic section highlighting. The relevant section will be highlighted when you visit the page.';
      } else if (domain.includes('patents.google.com')) {
        return 'Google Patents supports automatic section highlighting. The relevant section will be highlighted when you visit the page.';
      } else {
        return 'This website may not support automatic highlighting. You may need to manually search for the relevant section on the page.';
      }
    } catch (error) {
      console.warn('Error getting highlighting instructions:', error);
      return 'Unable to determine highlighting support for this website.';
    }
  }
}

// Create and export a singleton instance
const sourceHighlightingService = new SourceHighlightingService();
export default sourceHighlightingService;
