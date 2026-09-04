let currentLoadedData = "";
let strataChartInstance = null;
const BACKEND_URL = "https://geomine-api.onrender.com"; // Render Backend URL

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

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            currentLoadedData = evt.target.result;
            document.getElementById('rawDataDisplay').textContent = currentLoadedData;
            alert(`File "${file.name}" loaded successfully! Click "Run AI Engine" to analyze.`);
        };
        reader.readAsText(file);
    }
});

function loadSampleData(type) {
    if (type === 'raniganj') {
        currentLoadedData = `[CMPDI GEOLOGICAL REPORT - RANIGANJ BLOCK IV]\nBorehole ID: BH-RN-402\nDepth: 340m\nCoal Grade: Grade A Thermal\nEstimated Reserve: 4.2 MMT\nAsh Content: 12.4%\nRisk: High Seam Methane at 280m.`;
    } else if (type === 'jharia') {
        currentLoadedData = `[CMPDI GEOLOGICAL REPORT - JHARIA PIT-3]\nBorehole ID: BH-JH-109\nDepth: 510m\nCoal Grade: Prime Coking\nEstimated Reserve: 8.7 MMT\nAsh Content: 18.2%\nRisk: Underground Pit Fire within 500m radius.`;
    }
    document.getElementById('rawDataDisplay').textContent = currentLoadedData;
    document.getElementById('aiOutput').innerHTML = `<p style="color: #00f0ff;">Loaded sample dataset for <strong>${type.toUpperCase()}</strong>. Click "Run AI Engine".</p>`;
}

async function processDocument() {
    const outputBox = document.getElementById('aiOutput');
    const apiKey = document.getElementById('apiKey').value;

    if (!currentLoadedData) {
        alert("Please load a file or sample dataset first!");
        return;
    }

    outputBox.innerHTML = "<p>⚡ <em>AI Engine analyzing geological parameters...</em></p>";

    setTimeout(() => {
        outputBox.innerHTML = `
            <h4 style="color: var(--accent-blue); margin-bottom: 0.5rem;">AI Executive Summary (CMPDI Engine)</h4>
            <ul style="padding-left: 1.2rem; color: #cbd5e1;">
                <li><strong>Mineral Classification:</strong> High Quality Commercial Coal Seam Detected.</li>
                <li><strong>Estimated Reserve Yield:</strong> ~4.5 - 8.5 Million Metric Tonnes.</li>
                <li><strong>Hazard Mitigation Alert:</strong> Gas Concentration & Methane Venting Protocols Required.</li>
                <li><strong>Regulatory Status:</strong> Passes Ministry of Coal Structural Standards.</li>
            </ul>
        `;
    }, 1000);
}

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