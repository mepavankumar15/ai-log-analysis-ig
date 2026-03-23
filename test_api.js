const runTest = async () => {
    try {
        const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ logs: "Test error logs" })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Test Exception:", err);
    }
};

runTest();
