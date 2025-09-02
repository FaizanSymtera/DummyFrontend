import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider
} from '@mui/material';
import ClickableTableCell from './ClickableTableCell';
import { parseTableCell, extractUrlsFromCell } from '../utils/sourceParser';

const SourceTest = () => {
  const [testContent, setTestContent] = useState('[Aspirin](https://www.fda.gov/drugs/drug-approvals-and-databases#approval-history)');
  const [parsedResult, setParsedResult] = useState(null);
  const [extractedUrls, setExtractedUrls] = useState([]);

  const testCases = [
    '[Aspirin](https://www.fda.gov/drugs/drug-approvals-and-databases#approval-history)',
    '[Clinical Trial](https://clinicaltrials.gov/ct2/show/NCT123456#eligibility)',
    '[PubMed Article](https://pubmed.ncbi.nlm.nih.gov/12345678/#abstract)',
    '[Multiple Sources](https://www.fda.gov/drugs#info) + [PubMed](https://pubmed.ncbi.nlm.nih.gov/12345678/#abstract)',
    'Regular text without links',
    '[Invalid URL](not-a-valid-url)',
    '[Research Data](https://www.researchandmarkets.com/reports/pharmaceutical-market#overview)'
  ];

  const handleTestParse = () => {
    const parsed = parseTableCell(testContent);
    setParsedResult(parsed);
    
    const urls = extractUrlsFromCell(testContent);
    setExtractedUrls(urls);
    
    console.log('Test parse result:', parsed);
    console.log('Extracted URLs:', urls);
  };

  const handleTestCaseClick = (testCase) => {
    setTestContent(testCase);
    const parsed = parseTableCell(testCase);
    setParsedResult(parsed);
    
    const urls = extractUrlsFromCell(testCase);
    setExtractedUrls(urls);
    
    console.log('Test case result:', parsed);
    console.log('Extracted URLs:', urls);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Source Navigation Test
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Content
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            placeholder="Enter test content with markdown links..."
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleTestParse}>
            Test Parse
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Cases
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {testCases.map((testCase, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleTestCaseClick(testCase)}
              >
                Test {index + 1}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {parsedResult && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Parse Result
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '14px' }}>
                {JSON.stringify(parsedResult, null, 2)}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}

      {extractedUrls.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Extracted URLs
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <pre style={{ margin: 0, fontSize: '14px' }}>
                {JSON.stringify(extractedUrls, null, 2)}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Clickable Table Test
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <ClickableTableCell
                    cellContent="Drug Name"
                    isHeader={true}
                  />
                  <ClickableTableCell
                    cellContent="Source"
                    isHeader={true}
                  />
                  <ClickableTableCell
                    cellContent="Status"
                    isHeader={true}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <ClickableTableCell
                    cellContent="Aspirin"
                  />
                  <ClickableTableCell
                    cellContent="[FDA Approval](https://www.fda.gov/drugs/drug-approvals-and-databases#approval-history)"
                  />
                  <ClickableTableCell
                    cellContent="Approved"
                  />
                </TableRow>
                <TableRow>
                  <ClickableTableCell
                    cellContent="Ibuprofen"
                  />
                  <ClickableTableCell
                    cellContent="[Clinical Trial](https://clinicaltrials.gov/ct2/show/NCT123456#eligibility) + [PubMed](https://pubmed.ncbi.nlm.nih.gov/12345678/#abstract)"
                  />
                  <ClickableTableCell
                    cellContent="In Development"
                  />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          <strong>Instructions:</strong>
          <br />
          1. Enter test content with markdown links in the format: [text](url#section)
          <br />
          2. Click "Test Parse" to see the parsing results
          <br />
          3. Try the predefined test cases to see different scenarios
          <br />
          4. Check the browser console for detailed debugging information
          <br />
          5. Test the clickable table cells below to verify navigation works
        </Typography>
      </Alert>
    </Box>
  );
};

export default SourceTest;
