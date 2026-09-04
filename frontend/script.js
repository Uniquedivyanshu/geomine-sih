const BACKEND_URL = "https://geomine-sih.onrender.com"; // Your Render URL

let currentLoadedData = "";
let strataChartInstance = null;

// Tab Switching Logic (Fixes tab click issue)
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    if (tabName === 'summary') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('summaryTab').classList.add('active');
    } else if (tabName === 'charts') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('chartsTab').classList.add('active');
        renderChart();
    } else if (tabName === 'raw') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('rawTab').classList.add('active');
    }
}

// Render Chart Logic
function renderChart() {
    const ctx = document.getElementById('strataChart').getContext('2d');
    if (strataChartInstance) strataChartInstance.destroy();

    strataChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Overburden', 'Sandstone Layer', 'Coal Seam A', 'Shale Layer', 'Coal Seam B'],
            datasets: [{
                label: 'Layer Depth / Thickness (Meters)',
                data: [45, 120, 35, 80, 60],
                backgroundColor: ['#334155', '#94a3b8', '#ff6b00', '#475569', '#00f0ff']
            }]
        },
        options: {
            responsive: true,
            plugins: { title: { display: true, text: 'Geological Strata Profile Breakdown', color: '#fff' } },
            scales: { y: { ticks: { color: '#94a3b8' } }, x: { ticks: { color: '#94a3b8' } } }
        }
    });
}

// Sample Datasets Loader
function loadSampleData(type) {
    if (type === 'raniganj') {
        currentLoadedData = `[CMPDI GEOLOGICAL REPORT - RANIGANJ BLOCK IV]\nBorehole ID: BH-RN-402\nDepth: 340m\nCoal Grade: Grade A Thermal\nEstimated Reserve: 4.2 MMT\nAsh Content: 12.4%\nRisk: High Seam Methane at 280m.`;
    } else if (type === 'jharia') {
        currentLoadedData = `[CMPDI GEOLOGICAL REPORT - JHARIA PIT-3]\nBorehole ID: BH-JH-109\nDepth: 510m\nCoal Grade: Prime Coking\nEstimated Reserve: 8.7 MMT\nAsh Content: 18.2%\nRisk: Underground Pit Fire within 500m radius.`;
    }
    document.getElementById('rawDataDisplay').textContent = currentLoadedData;
    document.getElementById('aiOutput').innerHTML = `<p style="color: #00f0ff;">Loaded sample dataset for <strong>${type.toUpperCase()}</strong>. Click "Run AI Engine".</p>`;
}

// File Upload Handler
document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('aiOutput').innerHTML = `<p style="color: #00f0ff;">Selected File: <strong>${file.name}</strong>. Click "Run AI Engine" to analyze.</p>`;
    }
});

// Process Document via Python Backend
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
                document.getElementById('rawDataDisplay').textContent = data.summary;
            }
        } catch (err) {
            outputBox.innerHTML = "<p style='color:#ff4d4d;'>Failed to connect to Python Backend Server!</p>";
            console.error(err);
        }
    } else {
        outputBox.innerHTML = `
            <h4 style="color: var(--accent-blue);">Sample Dataset Summary</h4>
            <div style="white-space: pre-line; color: #cbd5e1;">${currentLoadedData}</div>
        `;
    }
}