const BACKEND_URL = "https://geomine-sih.onrender.com"; // Your Render URL

let currentLoadedData = null;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileNameDisplay').innerText = `Selected File: ${file.name}`;
    }
}

async function processDocument() {
    const outputBox = document.getElementById('aiOutput');
    const apiKey = document.getElementById('apiKey').value;
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files[0] && !currentLoadedData) {
        alert("Please select or upload a PDF file first!");
        return;
    }

    outputBox.innerHTML = "<p>⚡ <em>Sending document to Python Gemini Engine...</em></p>";

    if (fileInput.files[0]) {
        // Real PDF File Upload to Render Backend
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        if (apiKey) formData.append("api_key", apiKey);

        try {
            const response = await fetch(`${BACKEND_URL}/analyze-pdf`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (data.error) {
                outputBox.innerHTML = `<p style="color: #ff4d4d;">❌ Error: ${data.error}</p>`;
            } else {
                outputBox.innerHTML = `
                    <h4 style="color: var(--accent-blue); margin-bottom: 0.5rem;">AI Extraction Results (${data.filename})</h4>
                    <div style="white-space: pre-line; color: #cbd5e1;">${data.summary}</div>
                `;
            }
        } catch (err) {
            outputBox.innerHTML = "<p style='color:#ff4d4d;'>Failed to connect to Python Backend Server!</p>";
            console.error(err);
        }
    } else {
        // Sample Data Clicked
        outputBox.innerHTML = `
            <h4 style="color: var(--accent-blue);">Sample Dataset Summary</h4>
            <div style="white-space: pre-line; color: #cbd5e1;">${currentLoadedData}</div>
        `;
    }
}

function loadSample(sampleName) {
    const sampleData = {
        'Raniganj Coalfield Block-4': 'Geological Report: Raniganj Coalfield Block-4.\n- Estimated Reserves: 42.5 Million Tonnes\n- Coal Grade: Power Grade (G10/G11)\n- Seam Thickness: 3.2m average\n- Strata: Sandstone, Shale, High Moisture content.',
        'Jharia Seam Deep Pit-2': 'Geological Report: Jharia Seam Deep Pit-2.\n- Estimated Reserves: 88.1 Million Tonnes\n- Coal Grade: Coking Coal (W-II)\n- Methane Gas Index: High Risk Zone\n- Depth: 450m below surface level.'
    };
    currentLoadedData = sampleData[sampleName] || 'Sample data loaded.';
    document.getElementById('fileNameDisplay').innerText = `Loaded Sample: ${sampleName}`;
}