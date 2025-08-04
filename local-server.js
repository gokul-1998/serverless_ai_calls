// File: local-server.js
// A simple Node.js server to run the Vercel function locally without the Vercel CLI.

import http from 'http';
import dotenv from 'dotenv';
import handler from './api/explain.js';

// Load environment variables from .env file
dotenv.config();

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    // We only care about the /api/explain endpoint
    if (req.url === '/api/explain' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // Mock the Vercel request object
                const mockRequest = {
                    method: 'POST',
                    body: JSON.parse(body),
                    headers: req.headers
                };

                // Mock the Vercel response object
                const mockResponse = {
                    statusCode: 200,
                    headers: {},
                    body: null,
                    setHeader(name, value) {
                        this.headers[name] = value;
                    },
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },
                    json(data) {
                        this.setHeader('Content-Type', 'application/json');
                        this.body = JSON.stringify(data);
                        this.end();
                    },
                    end() {
                        res.writeHead(this.statusCode, this.headers);
                        res.end(this.body);
                    }
                };

                await handler(mockRequest, mockResponse);

            } catch (error) {
                console.error('Error parsing JSON or handling request:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Bad Request' }));
            }
        });

    } else if (req.url === '/api/explain' && req.method === 'OPTIONS') {
        // Handle CORS preflight request
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Local server running for /api/explain at http://localhost:${PORT}/api/explain`);
});
