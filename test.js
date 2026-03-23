fetch('http://localhost:5000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ logs: "Error: Connection timeout. Unable to connect to database at 10.0.0.5 on port 5432. Retrying in 5 seconds... Failed to acquire connection from pool." })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error("Test Request Failed:", err));
