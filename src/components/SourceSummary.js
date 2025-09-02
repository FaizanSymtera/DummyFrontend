import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link,
  Tooltip,
  Paper
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Link as LinkIcon,
  Launch,
  Info
} from '@mui/icons-material';
import { 
  extractSourcesFromTable, 
  getSourceDisplayName, 
  isAuthoritativeSource 
} from '../utils/sourceParser';

const SourceSummary = ({ tableRows, tableTitle }) => {
  const [expanded, setExpanded] = useState(false);
  const [sources] = useState(() => extractSourcesFromTable(tableRows));

  if (sources.length === 0) {
    return null;
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleOpenSource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const authoritativeSources = sources.filter(source => isAuthoritativeSource(source.url));
  const otherSources = sources.filter(source => !isAuthoritativeSource(source.url));

  return (
    <Paper sx={{ mt: 2, p: 2, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Sources ({sources.length})
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleToggle}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {authoritativeSources.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Authoritative Sources ({authoritativeSources.length}):
              </Typography>
              <List dense>
                {authoritativeSources.map((source, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LinkIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getSourceDisplayName(source.url)}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2">
                            {source.url}
                          </Typography>
                        </Box>
                      }
                    />
                    <Tooltip title="Open source">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenSource(source.url)}
                        sx={{ ml: 1 }}
                      >
                        <Launch fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {otherSources.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Other Sources ({otherSources.length}):
              </Typography>
              <List dense>
                {otherSources.map((source, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LinkIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={getSourceDisplayName(source.url)}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="body2">
                            {source.url}
                          </Typography>
                        </Box>
                      }
                    />
                    <Tooltip title="Open source">
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenSource(source.url)}
                        sx={{ ml: 1 }}
                      >
                        <Launch fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> Click on any cell in the table above to view detailed source information and navigate directly to the specific section of the source page.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default SourceSummary;
