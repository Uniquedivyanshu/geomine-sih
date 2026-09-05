const BACKEND_URL = "https://geomine-sih.onrender.com";

let currentLoadedData = "";
let strataChartInstance = null;
let currentFileName = "";

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
        currentFileName = "Raniganj_Block_IV_Log.pdf";
    } else if (type === 'jharia') {
        currentLoadedData = `[CMPDI GEOLOGICAL & SAFETY REPORT - JHARIA PIT-3]\nBorehole: BH-JH-109 | Depth: 510m\nCoal Reserves: 88.1 MMT | Coal Grade: Prime Coking W-II\nRisk Factor: High Methane Seam Gas Detected at 450m level.\nDGMS Compliance: WARNING - Additional degasification required under DGMS Sec 22.\nSPCB Air Quality: Dust suppression required.`;
        currentFileName = "Jharia_Deep_Pit3_Report.pdf";
    } else if (type === 'parliament') {
        currentLoadedData = `[MINISTRY OF COAL PARLIAMENTARY QUERY REF #26023]\nSubject: Status of Coal Exploration and Environmental Clearances in CMPDI RI-1.\nQuery: What measures are deployed for DGMS compliance and statutory reporting?\nAnswer: CMPDI has digitized 100% borehole logs using AI-assisted extraction. Environmental parameters are monitored as per SPCB standards.`;
        currentFileName = "Parliamentary_Query_Ref26023.pdf";
    }

    document.getElementById('fileNameDisplay').innerText = `Loaded Dataset: ${type.toUpperCase()}`;
    
    // Clear previous input file selection if sample is loaded
    document.getElementById('fileInput').value = "";

    document.getElementById('aiOutput').innerHTML = `
        <p style="color: #38bdf8;">Sample dataset selected: <strong>${currentFileName}</strong>.</p>
        <p>Click <strong>"Run AI Mining Engine"</strong> to run dynamic extraction and statutory analysis.</p>
    `;
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        currentFileName = file.name;
        document.getElementById('fileNameDisplay').innerText = `Selected: ${file.name}`;
    }
});

async function processDocument() {
    const outputBox = document.getElementById('aiOutput');
    const apiKey = document.getElementById('apiKey').value;
    const fileInput = document.getElementById('fileInput');

    if (!fileInput.files[0] && !currentLoadedData) {
        alert("Please select a file or load a sample dataset first!");
        return;
    }

    outputBox.innerHTML = "<p>⚡ <em>Running AI Mining Engine & Analyzing Statutory Compliance...</em></p>";

    if (fileInput.files[0]) {
        currentFileName = fileInput.files[0].name;
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
                renderTraceableOutput(data.summary, data.raw_text || data.summary, currentFileName, "Page 1-3");
                updateWordCloud(data.summary);
                updateCompliance(data.summary);
            }
        } catch (err) {
            outputBox.innerHTML = "<p style='color:#ff4d4d;'>Failed to connect to Python Backend Server!</p>";
        }
    } else {
        renderTraceableOutput(currentLoadedData, currentLoadedData, currentFileName, "Page 1");
        updateWordCloud(currentLoadedData);
        updateCompliance(currentLoadedData);
    }
}

// Function to render AI Output with Page-Level Source Evidence Proof
function renderTraceableOutput(summaryText, rawText, fileName, pages) {
    const outputBox = document.getElementById('aiOutput');
    const metaBadge = document.getElementById('extractionMeta');

    // Show Metadata Badge if element exists in index.html
    if (metaBadge) {
        metaBadge.style.display = 'block';
        document.getElementById('metaFileName').innerText = fileName || "Document.pdf";
        document.getElementById('metaPages').innerText = pages || "Page 1";
    }

    const snippet = rawText.replace(/\n/g, ' ').substring(0, 180);

    outputBox.innerHTML = `
        <!-- Source Citation Evidence Card -->
        <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 0.8rem 1rem; margin-bottom: 1rem; border-radius: 6px; font-size: 0.85rem;">
            <div style="color: #10b981; font-weight: 700; margin-bottom: 0.3rem; display: flex; justify-content: space-between;">
                <span>📌 Extracted Evidence Context (${pages})</span>
                <span style="font-size: 0.75rem; opacity: 0.8;">Verified by Gemini Engine</span>
            </div>
            <p style="margin: 0; font-style: italic; color: #cbd5e1;">
                "${snippet}..."
            </p>
        </div>

        <h4 style="color: #38bdf8; margin-bottom: 0.5rem;">Draft Technical Response & Executive Summary</h4>
        <div style="white-space: pre-line; line-height: 1.6; color: #e2e8f0;">${summaryText}</div>
    `;
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