require('dotenv').config({ override: true });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Basic Auth middleware for /secret route
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secret Area"');
    return res.status(401).send('Authentication required');
  }

  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
  const colonIndex = credentials.indexOf(':');
  
  if (colonIndex === -1) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secret Area"');
    return res.status(401).send('Invalid auth header format');
  }

  const username = credentials.substring(0, colonIndex);
  const password = credentials.substring(colonIndex + 1);

  const expectedUsername = process.env.USERNAME;
  const expectedPassword = process.env.PASSWORD;

  if (username === expectedUsername && password === expectedPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Secret Area"');
  return res.status(401).send('Invalid credentials');
};

// Protected /secret route
app.get('/secret', basicAuth, (req, res) => {
  const secretMessage = process.env.SECRET_MESSAGE || 'No secret message set.';
  res.send(secretMessage);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
