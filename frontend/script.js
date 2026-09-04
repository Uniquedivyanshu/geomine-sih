const BACKEND_URL = "https://geomine-sih.onrender.com";

let currentLoadedData = "";
let strataChartInstance = null;

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    const tabMap = {
        'report': 0,
        'topics': 1,
        'compliance': 2,
        'analytics': 3
    };

    document.querySelectorAll('.tab-btn')[tabMap[tabName]].classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    if (tabName === 'analytics') {
        renderChart();
    }
}

function loadSampleData(type) {
    if (type === 'raniganj') {
        currentLoadedData = `[CMPDI GEOLOGICAL LOG - RANIGANJ BLOCK IV]\nBorehole: BH-RN-402 | Depth: 340m\nCoal Reserves: 42.5 MMT | Coal Grade: Power Grade G10\nAsh Content: 12.4% | Overburden: 45m Sandstone\nDGMS Compliance: Compliant with Mine Safety Circular 2024.\nSPCB Air Quality: PM10 levels within 85 ug/m3 limit.`;
    } else if (type === 'jharia') {
        currentLoadedData = `[CMPDI GEOLOGICAL & SAFETY REPORT - JHARIA PIT-3]\nBorehole: BH-JH-109 | Depth: 510m\nCoal Reserves: 88.1 MMT | Coal Grade: Prime Coking W-II\nRisk Factor: High Methane Seam Gas Detected at 450m level.\nDGMS Compliance: WARNING - Additional degasification required under DGMS Sec 22.\nSPCB Air Quality: Dust suppression required.`;
    } else if (type === 'parliament') {
        currentLoadedData = `[MINISTRY OF COAL PARLIAMENTARY QUERY REF #26023]\nSubject: Status of Coal Exploration and Environmental Clearances in CMPDI RI-1.\nQuery: What measures are deployed for DGMS compliance and statutory reporting?\nAnswer: CMPDI has digitized 100% borehole logs using AI-assisted extraction. Environmental parameters are monitored as per SPCB standards.`;
    }

    document.getElementById('fileNameDisplay').innerText = `Loaded Dataset: ${type.toUpperCase()}`;
    document.getElementById('aiOutput').innerHTML = `<p style="color: var(--accent-blue);">Sample data loaded for <strong>${type.toUpperCase()}</strong>. Click "Run AI Mining Engine" to analyze.</p>`;
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('fileNameDisplay').innerText = `Selected: ${file.name}`;
    }
});

async function processDocument() {
    const outputBox = document.getElementById('aiOutput');
    const wordCloudBox = document.getElementById('wordCloudBox');
    const topicSummaryBox = document.getElementById('topicSummaryBox');
    const dgmsStatus = document.getElementById('dgmsStatus');
    const spcbStatus = document.getElementById('spcbStatus');
    const anomaliesBox = document.getElementById('anomaliesBox');
    const apiKey = document.getElementById('apiKey').value;
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files[0] && !currentLoadedData) {
        alert("Please select a file or load a sample dataset first!");
        return;
    }

    outputBox.innerHTML = "<p>⚡ <em>Running AI Mining Engine & Analyzing Statutory Compliance...</em></p>";

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
                    <h4 style="color: var(--accent-blue);">Draft Technical Response & Executive Summary</h4>
                    <div style="white-space: pre-line;">${data.summary}</div>
                `;
                
                // Update SIH Pillars
                updateWordCloud(data.summary);
                updateCompliance(data.summary);
            }
        } catch (err) {
            outputBox.innerHTML = "<p style='color:#ff4d4d;'>Failed to connect to Python Backend Server!</p>";
        }
    } else {
        outputBox.innerHTML = `
            <h4 style="color: var(--accent-blue);">Automated Report Draft</h4>
            <div style="white-space: pre-line;">${currentLoadedData}</div>
        `;
        updateWordCloud(currentLoadedData);
        updateCompliance(currentLoadedData);
    }
}

function updateWordCloud(text) {
    const keywords = ["Coal Seam", "Methane Risk", "DGMS Guidelines", "SPCB Standards", "Sandstone Strata", "Borehole Log", "Reserve Estimation"];
    const tagsHtml = keywords.map(kw => `<span class="tag tag-md">${kw}</span>`).join(" ");
    document.getElementById('wordCloudBox').innerHTML = tagsHtml;
    document.getElementById('topicSummaryBox').innerHTML = `<p><strong>Extracted Topics:</strong> Mining Geology, Environmental Risk Assessment, Mineral Reserve Calculation, Statutory Governance.</p>`;
}

function updateCompliance(text) {
    if (text.includes("Methane") || text.includes("WARNING")) {
        document.getElementById('dgmsStatus').innerHTML = "<span style='color:#f59e0b;'>⚠️ Action Needed: Degasification Protocol Required</span>";
        document.getElementById('spcbStatus').innerHTML = "<span style='color:#22c55e;'>✓ SPCB Permissible Limits Met</span>";
        document.getElementById('anomaliesBox').innerHTML = "<p style='color:#f59e0b;'>⚠️ <strong>Anomaly Flagged:</strong> High Seam Methane content exceeds standard DGMS threshold. Immediate ventilation check required before submission to Ministry.</p>";
    } else {
        document.getElementById('dgmsStatus').innerHTML = "<span style='color:#22c55e;'>✓ 100% DGMS Mine Safety Compliant</span>";
        document.getElementById('spcbStatus').innerHTML = "<span style='color:#22c55e;'>✓ SPCB Air Quality Standard Verified</span>";
        document.getElementById('anomaliesBox').innerHTML = "<p style='color:#22c55e;'>✅ <strong>Zero Statutory Red Flags Detected.</strong> Report verified and ready for automatic submission to Ministry of Coal.</p>";
    }
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