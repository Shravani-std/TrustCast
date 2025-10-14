import React from 'react';
import { Button } from '@mui/material';
import Papa from 'papaparse';

const FileUpload = ({ setData }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => setData(results.data)
    });
  };

  return (
    <Button variant="contained" component="label">
      Upload Data
      <input type="file" hidden onChange={handleFileUpload} />
    </Button>
  );
};

export default FileUpload;
