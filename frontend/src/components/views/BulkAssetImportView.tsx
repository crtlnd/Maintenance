import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, X, Download } from 'lucide-react';

const BulkAssetImport = (props) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Required fields based on your Asset schema
  const requiredFields = [
    'id', 'name', 'location', 'organization', 'userId',
    'type', 'manufacturer', 'model'
  ];

  // Optional but recommended fields
  const optionalFields = [
    'serialNumber', 'status', 'condition', 'industry', 'subAsset',
    'yearManufactured', 'operatingHours', 'purchaseDate', 'purchasePrice',
    'warrantyExpiration', 'lastServiceDate', 'nextServiceDate'
  ];

  // Flexible date parsing that handles multiple formats
  const parseDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null;

    const cleaned = dateStr.trim();

    // Handle Excel date numbers (days since 1900-01-01)
    if (/^\d{5}$/.test(cleaned)) {
      const excelDate = new Date(1900, 0, parseInt(cleaned) - 1);
      return excelDate;
    }

    // Try to parse the date
    let parsedDate = new Date(cleaned);

    // If that fails, try manual parsing for common formats
    if (isNaN(parsedDate)) {
      // Try MM/DD/YYYY format
      const mmddyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (mmddyyyy) {
        parsedDate = new Date(mmddyyyy[3], mmddyyyy[1] - 1, mmddyyyy[2]);
      }

      // Try DD/MM/YYYY format
      const ddmmyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy && isNaN(parsedDate)) {
        parsedDate = new Date(ddmmyyyy[3], ddmmyyyy[2] - 1, ddmmyyyy[1]);
      }
    }

    // Validate the parsed date is reasonable
    if (isNaN(parsedDate) || parsedDate.getFullYear() < 1900 || parsedDate.getFullYear() > 2100) {
      return 'invalid';
    }

    return parsedDate;
  };

  const formatDateForDisplay = (date) => {
    if (!date || date === 'invalid') return date;
    return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  };

  // Security: Sanitize input to prevent XSS and injection attacks
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';

    // Remove potentially dangerous characters and patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
      .substring(0, 1000); // Limit length to prevent DoS
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      alert('Please upload a CSV file only.');
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file) => {
    setIsProcessing(true);

    try {
      // Security: Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Security: Validate file type more strictly
      if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Invalid file type. Only CSV files are allowed.');
      }

      const text = await file.text();

      // Security: Check for extremely large content
      if (text.length > 10 * 1024 * 1024) {
        throw new Error('File content too large');
      }

      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      // Security: Limit number of rows to prevent DoS
      if (lines.length > 10000) {
        throw new Error('CSV exceeds maximum of 10,000 rows');
      }

      // Security: Parse CSV more safely and sanitize all input
      const headers = lines[0]
        .split(',')
        .map(h => sanitizeString(h.replace(/"/g, '')))
        .filter(h => h.length > 0)
        .slice(0, 50); // Limit number of columns

      // Security: Validate headers against allowed fields only
      const allowedFields = [...requiredFields, ...optionalFields];
      const validHeaders = headers.filter(header =>
        allowedFields.some(field => field.toLowerCase() === header.toLowerCase())
      );

      if (validHeaders.length === 0) {
        throw new Error('No valid column headers found. Please check your CSV format.');
      }

      const rows = lines.slice(1).map((line, index) => {
        if (index > 9999) return null; // Extra safety check

        const values = line.split(',').map(v => sanitizeString(v.replace(/"/g, '')));
        const row = {};

        headers.forEach((header, index) => {
          if (index < values.length && allowedFields.some(field => field.toLowerCase() === header.toLowerCase())) {
            row[header] = values[index] || '';
          }
        });

        return row;
      }).filter(row => row !== null);

      setCsvData({ headers: validHeaders, rows });
      validateData(validHeaders, rows);
    } catch (error) {
      alert(`Error parsing CSV: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = (headers, rows) => {
    const validation = {
      missingRequiredFields: [],
      rowIssues: [],
      duplicateSerialNumbers: [],
      summary: {
        totalRows: rows.length,
        validRows: 0,
        warningRows: 0,
        errorRows: 0
      }
    };

    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!headers.some(h => h.toLowerCase() === field.toLowerCase())) {
        validation.missingRequiredFields.push(field);
      }
    });

    // Check each row for issues
    const serialNumbers = new Map();

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV rows start at line 2
      const issues = [];

      // Security: Validate data types and ranges
      if (row.id && (isNaN(row.id) || parseInt(row.id) < 1 || parseInt(row.id) > 999999)) {
        issues.push('Invalid ID: must be a number between 1 and 999999');
      }

      if (row.yearManufactured && (isNaN(row.yearManufactured) || parseInt(row.yearManufactured) < 1900 || parseInt(row.yearManufactured) > new Date().getFullYear() + 1)) {
        issues.push('Invalid year: must be between 1900 and next year');
      }

      if (row.operatingHours && (isNaN(row.operatingHours) || parseInt(row.operatingHours) < 0 || parseInt(row.operatingHours) > 1000000)) {
        issues.push('Invalid operating hours: must be between 0 and 1,000,000');
      }

      if (row.purchasePrice && (isNaN(row.purchasePrice) || parseFloat(row.purchasePrice) < 0 || parseFloat(row.purchasePrice) > 10000000)) {
        issues.push('Invalid purchase price: must be between 0 and 10,000,000');
      }

      // Validate date formats - simplified for now
      const dateFields = ['purchaseDate', 'warrantyExpiration', 'lastServiceDate', 'nextServiceDate'];
      dateFields.forEach(field => {
        if (row[field]) {
          // Simple date validation - just check if it's not empty
          // More complex parsing can be added later
          if (row[field].trim() === '') {
            issues.push(`Empty ${field} field`);
          }
        }
      });

      // Validate enum fields
      if (row.status && !['operational', 'maintenance', 'down', 'retired'].includes(row.status.toLowerCase())) {
        issues.push('Invalid status: must be operational, maintenance, down, or retired');
      }

      if (row.condition && !['excellent', 'good', 'fair', 'poor'].includes(row.condition.toLowerCase())) {
        issues.push('Invalid condition: must be excellent, good, fair, or poor');
      }

      if (row.industry && !['oil/gas', 'construction', 'manufacturing', 'other'].includes(row.industry.toLowerCase())) {
        issues.push('Invalid industry: must be oil/gas, construction, manufacturing, or other');
      }

      // Check required fields
      requiredFields.forEach(field => {
        const headerMatch = headers.find(h => h.toLowerCase() === field.toLowerCase());
        if (headerMatch && !row[headerMatch]) {
          issues.push(`Missing required field: ${field}`);
        }
      });

      // Check serial number duplicates (but don't require them)
      if (row.serialNumber) {
        // Security: Validate serial number format
        if (row.serialNumber.length > 100) {
          issues.push('Serial number too long (max 100 characters)');
        }

        if (serialNumbers.has(row.serialNumber)) {
          issues.push(`Duplicate serial number: ${row.serialNumber}`);
          validation.duplicateSerialNumbers.push({
            serialNumber: row.serialNumber,
            rows: [serialNumbers.get(row.serialNumber), rowNumber]
          });
        } else {
          serialNumbers.set(row.serialNumber, rowNumber);
        }
      } else {
        issues.push('Missing serial number (will need to be handled)');
      }

      if (issues.length > 0) {
        validation.rowIssues.push({
          rowNumber,
          assetName: sanitizeString(row.name || 'Unnamed Asset'),
          issues,
          severity: issues.some(i => i.includes('required') || i.includes('Invalid')) ? 'error' : 'warning'
        });

        if (issues.some(i => i.includes('required') || i.includes('Invalid'))) {
          validation.summary.errorRows++;
        } else {
          validation.summary.warningRows++;
        }
      } else {
        validation.summary.validRows++;
      }
    });

    setValidationResults(validation);
  };

  const downloadTemplate = () => {
    const templateHeaders = [...requiredFields, ...optionalFields];
    const sampleRow = [
      '1001', 'Excavator CAT 320', 'Site A - Warehouse', 'Casey Construction', 'user123',
      'Excavator', 'Caterpillar', '320GC', 'CAT0G123456', 'operational', 'good',
      'construction', 'Main excavator', '2020', '1250', '2020-03-15', '125000',
      '2023-03-15', '2024-08-01', '2024-11-01'
    ];

    const csvContent = [
      templateHeaders.join(','),
      sampleRow.slice(0, templateHeaders.length).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casey_asset_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setCsvData(null);
    setValidationResults(null);
    setImportResults(null);
    setShowSuccess(false);
  };

  const handleImport = async () => {
    if (!csvData || !validationResults) return;

    setIsProcessing(true);

    try {
      // Get JWT token for authentication
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare assets data for backend
      const assetsToImport = csvData.rows.map(row => {
        const asset = {};

        // Map CSV headers to asset fields (case-insensitive)
        csvData.headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          const value = row[header];

          // Map common variations to standard field names
          if (lowerHeader === 'id' || lowerHeader === 'asset id' || lowerHeader === 'assetid') {
            asset.id = parseInt(value) || undefined;
          } else if (lowerHeader === 'name' || lowerHeader === 'asset name' || lowerHeader === 'assetname') {
            asset.name = value;
          } else if (lowerHeader === 'type' || lowerHeader === 'asset type' || lowerHeader === 'assettype') {
            asset.type = value;
          } else if (lowerHeader === 'manufacturer') {
            asset.manufacturer = value;
          } else if (lowerHeader === 'model') {
            asset.model = value;
          } else if (lowerHeader === 'serialnumber' || lowerHeader === 'serial number' || lowerHeader === 'serial_number') {
            asset.serialNumber = value;
          } else if (lowerHeader === 'location') {
            asset.location = value;
          } else if (lowerHeader === 'organization') {
            asset.organization = value;
          } else if (lowerHeader === 'status') {
            asset.status = value;
          } else if (lowerHeader === 'condition') {
            asset.condition = value;
          } else if (lowerHeader === 'yearmanufactured' || lowerHeader === 'year manufactured' || lowerHeader === 'year_manufactured') {
            asset.yearManufactured = parseInt(value) || undefined;
          } else if (lowerHeader === 'operatinghours' || lowerHeader === 'operating hours' || lowerHeader === 'operating_hours') {
            asset.operatingHours = parseInt(value) || undefined;
          } else if (lowerHeader === 'purchasedate' || lowerHeader === 'purchase date' || lowerHeader === 'purchase_date') {
            asset.purchaseDate = value;
          } else if (lowerHeader === 'purchaseprice' || lowerHeader === 'purchase price' || lowerHeader === 'purchase_price') {
            asset.purchasePrice = parseFloat(value) || undefined;
          } else if (lowerHeader === 'warrantyexpiration' || lowerHeader === 'warranty expiration' || lowerHeader === 'warranty_expiration') {
            asset.warrantyExpiration = value;
          } else if (lowerHeader === 'lastservicedate' || lowerHeader === 'last service date' || lowerHeader === 'last_service_date') {
            asset.lastServiceDate = value;
          } else if (lowerHeader === 'nextservicedate' || lowerHeader === 'next service date' || lowerHeader === 'next_service_date') {
            asset.nextServiceDate = value;
          }
        });

        return asset;
      });

      console.log('Sending assets to backend:', assetsToImport);

      const response = await fetch('/api/assets/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assets: assetsToImport })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Import failed with status ${response.status}`);
      }

      setImportResults(result);
      setShowSuccess(true);

      // Call the parent callback if provided
      if (props.onImportComplete) {
        props.onImportComplete(result.assets || []);
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        error: error.message,
        imported: 0,
        total: csvData.rows.length
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Asset Import</h1>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            Download Template
          </button>
        </div>

        {/* File Upload Area */}
        {!file && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Asset Data
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose CSV File
            </label>
            <p className="text-sm text-gray-500 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        )}

        {/* File Info */}
        {file && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Processing CSV file...</p>
          </div>
        )}

        {/* Validation Results */}
        {validationResults && !showSuccess && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Import Summary</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {validationResults.summary.totalRows}
                  </div>
                  <div className="text-sm text-gray-600">Total Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validationResults.summary.validRows}
                  </div>
                  <div className="text-sm text-gray-600">Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validationResults.summary.warningRows}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {validationResults.summary.errorRows}
                  </div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </div>

            {/* Missing Required Fields */}
            {validationResults.missingRequiredFields.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Missing Required Fields</h4>
                </div>
                <p className="text-red-700 mb-2">
                  Your CSV is missing these required columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {validationResults.missingRequiredFields.map(field => (
                    <span key={field} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Row Issues */}
            {validationResults.rowIssues.length > 0 && (
              <div className="bg-white border rounded-lg">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h4 className="font-medium text-gray-900">Row Issues</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {validationResults.rowIssues.map((issue, index) => (
                    <div key={index} className="px-4 py-3 border-b last:border-b-0">
                      <div className="flex items-start gap-3">
                        {issue.severity === 'error' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              Row {issue.rowNumber}: {issue.assetName}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              issue.severity === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {issue.issues.map((msg, i) => (
                              <li key={i}>• {msg}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="flex gap-4">
              <button
                disabled={validationResults.summary.errorRows > 0 || isProcessing}
                onClick={handleImport}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: validationResults.summary.errorRows > 0 || isProcessing ? 'not-allowed' : 'pointer',
                  backgroundColor: validationResults.summary.errorRows > 0 || isProcessing ? '#9CA3AF' : '#000000',
                  color: '#FFFFFF'
                }}
              >
                {isProcessing ? 'Importing...' : `Import ${validationResults.summary.validRows + validationResults.summary.warningRows} Assets`}
              </button>
              <button
                onClick={clearFile}
                disabled={isProcessing}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Upload Different File
              </button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {importResults && (
          <div className="space-y-4">
            {importResults.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-900">Import Failed</h4>
                </div>
                <p className="text-red-700">{importResults.error}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Import Successful!</h4>
                </div>
                <p className="text-green-700">
                  Successfully imported {importResults.imported} of {importResults.total} assets.
                </p>
                {importResults.warnings && importResults.warnings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {importResults.warnings.map((warning, index) => (
                        <li key={index}>• Row {warning.row}: {warning.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    View Assets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssetImport;
