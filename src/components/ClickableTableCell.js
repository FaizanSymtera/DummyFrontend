import React, { useState } from 'react';
import {
  TableCell,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Link,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Snackbar
} from '@mui/material';
import {
  OpenInNew,
  Link as LinkIcon,
  Info,
  Launch,
  Search,
  Warning,
  CheckCircle,
  MultipleStop
} from '@mui/icons-material';
import { 
  parseTableCell, 
  generateHighlightUrl, 
  isAuthoritativeSource, 
  getSourceDisplayName,
  extractUrlsFromCell
} from '../utils/sourceParser';
import sourceHighlightingService from '../services/sourceHighlighting';

const ClickableTableCell = ({ 
  cellContent, 
  isHeader = false,
  sx = {},
  ...props 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Parse the cell content for source information
  const parsedCell = parseTableCell(cellContent);

  // Debug logging
  React.useEffect(() => {
    if (parsedCell.isClickable) {
      console.log('Clickable cell detected:', {
        text: parsedCell.text,
        sourceUrl: parsedCell.sourceUrl,
        sectionId: parsedCell.sectionId,
        hasMultipleSources: !!parsedCell.multipleSources
      });
    }
  }, [parsedCell]);

  const handleCellClick = () => {
    if (parsedCell.isClickable) {
      console.log('Cell clicked:', parsedCell);
      
      const accessibility = sourceHighlightingService.checkUrlAccessibility(parsedCell.sourceUrl);
      const alternatives = sourceHighlightingService.getAlternativeStrategies(parsedCell.sourceUrl, parsedCell.sectionId);
      
      setSourceInfo({
        text: parsedCell.text,
        sourceUrl: parsedCell.sourceUrl,
        sectionId: parsedCell.sectionId,
        displayName: getSourceDisplayName(parsedCell.sourceUrl),
        isAuthoritative: isAuthoritativeSource(parsedCell.sourceUrl),
        accessibility,
        alternatives,
        multipleSources: parsedCell.multipleSources
      });
      setDialogOpen(true);
    }
  };

  const handleOpenSource = (url = null, sectionId = null) => {
    const targetUrl = url || sourceInfo?.sourceUrl;
    const targetSectionId = sectionId || sourceInfo?.sectionId;
    
    if (targetUrl) {
      console.log('Opening source:', { targetUrl, targetSectionId });
      const highlightUrl = sourceHighlightingService.generateHighlightUrl(targetUrl, targetSectionId);
      console.log('Generated highlight URL:', highlightUrl);
      window.open(highlightUrl, '_blank', 'noopener,noreferrer');
      
      setNotification({
        open: true,
        message: 'Source opened in new tab',
        severity: 'success'
      });
      
      if (!url) setDialogOpen(false);
    }
  };

  const handleCopyUrl = (url = null, sectionId = null) => {
    const targetUrl = url || sourceInfo?.sourceUrl;
    const targetSectionId = sectionId || sourceInfo?.sectionId;
    
    if (targetUrl) {
      const highlightUrl = sourceHighlightingService.generateHighlightUrl(targetUrl, targetSectionId);
      navigator.clipboard.writeText(highlightUrl);
      console.log('URL copied to clipboard:', highlightUrl);
      
      setNotification({
        open: true,
        message: 'URL copied to clipboard',
        severity: 'success'
      });
    }
  };

  const handleAlternativeClick = (alternativeUrl) => {
    console.log('Opening alternative URL:', alternativeUrl);
    window.open(alternativeUrl, '_blank', 'noopener,noreferrer');
    
    setNotification({
      open: true,
      message: 'Alternative source opened in new tab',
      severity: 'info'
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // If it's a header cell, render normally
  if (isHeader) {
    return (
      <TableCell 
        sx={{ 
          fontWeight: 600,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          ...sx
        }}
        {...props}
      >
        {parsedCell.displayText}
      </TableCell>
    );
  }

  // If cell has source information, make it clickable
  if (parsedCell.isClickable) {
    const hasMultipleSources = parsedCell.multipleSources && parsedCell.multipleSources.length > 1;
    
    return (
      <>
        <TableCell
          onClick={handleCellClick}
          sx={{
            fontSize: '0.875rem',
            maxWidth: 200,
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              '& .source-indicator': {
                opacity: 1
              }
            },
            ...sx
          }}
          {...props}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {parsedCell.displayText}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {hasMultipleSources ? (
                <Badge badgeContent={parsedCell.multipleSources.length} color="primary">
                  <MultipleStop 
                    className="source-indicator"
                    sx={{ 
                      fontSize: 16, 
                      color: 'primary.main', 
                      opacity: 0.6,
                      transition: 'opacity 0.2s'
                    }} 
                  />
                </Badge>
              ) : (
                <LinkIcon 
                  className="source-indicator"
                  sx={{ 
                    fontSize: 16, 
                    color: 'primary.main', 
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                  }} 
                />
              )}
            </Box>
          </Box>
          
          <Tooltip title={hasMultipleSources ? `Click to view ${parsedCell.multipleSources.length} sources` : "Click to view source"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCellClick();
              }}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                opacity: 0,
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Source Information Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" />
              <Typography variant="h6">
                Source Information
              </Typography>
              {hasMultipleSources && (
                <Chip 
                  label={`${parsedCell.multipleSources.length} sources`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Information:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {sourceInfo?.text}
              </Typography>
            </Box>

            {/* Multiple Sources Section */}
            {hasMultipleSources && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sources ({parsedCell.multipleSources.length}):
                </Typography>
                <List dense>
                  {parsedCell.multipleSources.map((source, index) => {
                    const sourceDisplayName = getSourceDisplayName(source.sourceUrl);
                    const isAuthoritative = isAuthoritativeSource(source.sourceUrl);
                    const accessibility = sourceHighlightingService.checkUrlAccessibility(source.sourceUrl);
                    
                    return (
                      <ListItem 
                        key={index}
                        sx={{ 
                          border: '1px solid rgba(0,0,0,0.1)', 
                          borderRadius: 1, 
                          mb: 1,
                          flexDirection: 'column',
                          alignItems: 'flex-start'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                          <Chip 
                            label={sourceDisplayName}
                            color={isAuthoritative ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                          {isAuthoritative && (
                            <Chip 
                              label="Authoritative"
                              color="success"
                              size="small"
                              variant="filled"
                            />
                          )}
                          <Box sx={{ flex: 1 }} />
                          <IconButton
                            size="small"
                            onClick={() => handleOpenSource(source.sourceUrl, source.sectionId)}
                            disabled={!accessibility.accessible}
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyUrl(source.sourceUrl, source.sectionId)}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Link 
                          href={source.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            wordBreak: 'break-all',
                            fontSize: '0.875rem',
                            color: 'primary.main'
                          }}
                        >
                          {source.sourceUrl}
                          {source.sectionId && `#${source.sectionId}`}
                        </Link>
                        
                        {!accessibility.accessible && (
                          <Alert severity="warning" sx={{ mt: 1, width: '100%' }}>
                            {accessibility.reason}
                          </Alert>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}

            {/* Single Source Section */}
            {!hasMultipleSources && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Source:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    label={sourceInfo?.displayName || 'Unknown Source'}
                    color={sourceInfo?.isAuthoritative ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                  {sourceInfo?.isAuthoritative && (
                    <Chip 
                      label="Authoritative"
                      color="success"
                      size="small"
                      variant="filled"
                    />
                  )}
                </Box>
                <Link 
                  href={sourceInfo?.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    wordBreak: 'break-all',
                    fontSize: '0.875rem'
                  }}
                >
                  {sourceInfo?.sourceUrl}
                </Link>
              </Box>
            )}

            {/* Accessibility Status */}
            {sourceInfo?.accessibility && !hasMultipleSources && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Accessibility Status:
                </Typography>
                <Alert 
                  severity={sourceInfo.accessibility.accessible ? 'success' : 'warning'}
                  icon={sourceInfo.accessibility.accessible ? <CheckCircle /> : <Warning />}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2">
                    {sourceInfo.accessibility.reason}
                  </Typography>
                </Alert>
              </Box>
            )}

            {sourceInfo?.sectionId && !hasMultipleSources && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Section:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  #{sourceInfo.sectionId}
                </Typography>
              </Box>
            )}

            {/* Alternative Search Options */}
            {sourceInfo?.alternatives && sourceInfo.alternatives.length > 0 && !hasMultipleSources && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Alternative Search Options:
                </Typography>
                <List dense>
                  {sourceInfo.alternatives.map((alternative, index) => (
                    <ListItem 
                      key={index}
                      button
                      onClick={() => handleAlternativeClick(alternative.url)}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemIcon>
                        <Search fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={alternative.description}
                        secondary={alternative.url}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> Clicking "Open Source" will navigate to the specific section of the source page. 
                If the section is not found, try using the alternative search options above or manually search the website.
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {!hasMultipleSources && (
              <>
                <Button onClick={handleCopyUrl} startIcon={<LinkIcon />}>
                  Copy URL
                </Button>
                <Button 
                  onClick={() => handleOpenSource()} 
                  variant="contained" 
                  startIcon={<Launch />}
                  disabled={!sourceInfo?.accessibility?.accessible}
                >
                  Open Source
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Regular cell without source information
  return (
    <TableCell
      sx={{
        fontSize: '0.875rem',
        maxWidth: 200,
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        ...sx
      }}
      {...props}
    >
      {parsedCell.displayText}
    </TableCell>
  );
};

export default ClickableTableCell;
