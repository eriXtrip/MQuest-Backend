// services/backend_log.js
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

// Setup log directory
const logDir = path.join(__dirname, '../log');
const logFilePath = path.join(logDir, 'backend_log.txt');

fsPromises.mkdir(logDir, { recursive: true }).catch(err => {
  //console.error('Failed to create log directory:', err);
});

// Logger function to write to backend_log.txt
export const logToBackend = async ({ action, details }) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ACTION: ${action} - DETAILS: ${details || 'N/A'}\n`;
  
  try {
    await fsPromises.appendFile(logFilePath, logMessage, 'utf8');
    //console.log(logMessage.trim()); // Optional: console output
  } catch (err) {
    //console.error('Failed to write to backend log file:', err);
  }
};
