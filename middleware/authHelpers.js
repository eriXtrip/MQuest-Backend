// my-app-backend/middleware/authHelpers.js

import jwt from 'jsonwebtoken';
import pool from '../services/db.js';

export const verifyAndDecodeToken = async (req) => {
  const token = req.headers.authorization?.split(' ')[1]?.trim();
  if (!token) {
    throw new Error('No authentication token provided');
  }

  // Use case-sensitive comparison and limit the result
  const [revoked] = await pool.query(
    'SELECT 1 FROM revoked_tokens WHERE BINARY token = ? LIMIT 1',
    [token]
  );

  if (revoked.length > 0) {
    throw new Error('Token revoked');
  }

  // Verify JWT
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
  return decoded;
};
