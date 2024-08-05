// App.tsx
import React, { useState } from 'react';
import { Button, View, Text } from 'react-native';
import DocumentPicker, { types, DocumentPickerResponse } from 'react-native-document-picker';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import axios from 'axios';

const App = () => {
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleFileUpload = async () => {
    try {
      const res: DocumentPickerResponse[] = await DocumentPicker.pick({
        type: [types.allFiles],
      });
      const file = res[0];
      if (file.name) {
        setFileName(file.name);
      } else {
        console.log('File name is null');
        return;
      }

      // Handle file parsing based on file type
      const fileUri = file.uri;
      const fileType = file.type;
      let data;
      if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const fileBuffer = await fetch(fileUri).then(res => res.arrayBuffer());
        const workbook = XLSX.read(fileBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else if (fileType === 'text/csv') {
        const fileText = await fetch(fileUri).then(res => res.text());
        data = Papa.parse(fileText, { header: true }).data;
      }

      // Send data to backend for validation
      const response = await axios.post('https://data-valex-kiyiemht2-rtleongs-projects.vercel.app/validate', { data });
      setValidationResult(response.data);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User canceled the upload');
      } else {
        console.log('Error:', err);
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Upload File" onPress={handleFileUpload} />
      {fileName ? <Text>File: {fileName}</Text> : null}
      {validationResult ? <Text>Validation Result: {JSON.stringify(validationResult)}</Text> : null}
    </View>
  );
};

export default App;

