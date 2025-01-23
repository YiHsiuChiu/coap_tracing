// Import required modules
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001; // Port number for the server
const logFilePath = path.join(__dirname, 'spans.json');
let writeStream;

// Ensure the log file exists, if not, create it
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '');
}

// Open a write stream to the log file
writeStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Create the server
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/span') {
        let body = '';

        // Collect data from the request
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const span = JSON.parse(body);

                console.log('Received a span which spanId is:', span.spanId);

                if (!span || typeof span !== 'object') {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Invalid span format. Expected a JSON object.' }));
                }

                // Append the new span to the log file as a JSON string
                writeStream.write(`${fs.statSync(logFilePath).size > 2 ? ',\n' : ''}${JSON.stringify(span)}`, 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Span received and logged successfully.' }));
            } catch (err) {
                console.error('Error handling span:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to process the span.' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Log handler server is running on port ${PORT}`);
});
