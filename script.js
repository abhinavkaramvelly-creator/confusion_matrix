const canvas = document.getElementById('classification-canvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('reset-btn');
const noiseSlider = document.getElementById('noise-level');

// DOM Elements for Matrix and Metrics
const elTP = document.getElementById('val-tp');
const elTN = document.getElementById('val-tn');
const elFP = document.getElementById('val-fp');
const elFN = document.getElementById('val-fn');

const elAcc = document.getElementById('metric-accuracy');
const elPrec = document.getElementById('metric-precision');
const elRec = document.getElementById('metric-recall');
const elF1 = document.getElementById('metric-f1');

// State
let points = [];
let decisionLine = {
    x1: 0.2, y1: 0.8,
    x2: 0.8, y2: 0.2
};
let isDragging = null; // 'p1', 'p2', or 'center'

// Constants
const TOTAL_POINTS = 200;
const POINT_RADIUS = 5;
const HANDLE_RADIUS = 8;
const PADDING = 20;

// Resize canvas
function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);

// Data Generation
function generateData() {
    points = [];
    const noise = parseInt(noiseSlider.value) / 200; // 0.0 to 0.5
    
    // Class 1 (Positive) - Top Rightish
    for (let i = 0; i < TOTAL_POINTS / 2; i++) {
        points.push({
            x: 0.7 + (Math.random() - 0.5) * (0.3 + noise),
            y: 0.3 + (Math.random() - 0.5) * (0.3 + noise),
            actual: 1
        });
    }

    // Class 0 (Negative) - Bottom Leftish
    for (let i = 0; i < TOTAL_POINTS / 2; i++) {
        points.push({
            x: 0.3 + (Math.random() - 0.5) * (0.3 + noise),
            y: 0.7 + (Math.random() - 0.5) * (0.3 + noise),
            actual: 0
        });
    }
    updateMetrics();
    draw();
}

// Logic: Determine side of line
// Line vector V = P2 - P1. Normal N = (-Vy, Vx).
// Vector P = Point - P1.
// Dot(P, N) determines side.
function getPrediction(point) {
    const vx = decisionLine.x2 - decisionLine.x1;
    const vy = decisionLine.y2 - decisionLine.y1;
    
    // Check if point is to the "left/right" (using cross product z-component idea)
    // (x - x1)(y2 - y1) - (y - y1)(x2 - x1)
    const val = (point.x - decisionLine.x1) * vy - (point.y - decisionLine.y1) * vx;
    
    // Arbitrary convention: one side is 1, other is 0.
    // Let's assume one side is "Positive". Visual feedback will confirm.
    return val > 0 ? 1 : 0;
}

function updateMetrics() {
    let tp = 0, tn = 0, fp = 0, fn = 0;

    points.forEach(p => {
        const pred = getPrediction(p);
        if (p.actual === 1 && pred === 1) tp++;
        if (p.actual === 0 && pred === 0) tn++;
        if (p.actual === 0 && pred === 1) fp++;
        if (p.actual === 1 && pred === 0) fn++;
    });

    // Update DOM
    elTP.textContent = tp;
    elTN.textContent = tn;
    elFP.textContent = fp;
    elFN.textContent = fn;

    // Calculate Metrics
    const total = points.length;
    const accuracy = total === 0 ? 0 : (tp + tn) / total;
    const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
    const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
    const f1 = (precision + recall) === 0 ? 0 : 2 * (precision * recall) / (precision + recall);

    elAcc.textContent = Math.round(accuracy * 100) + '%';
    elPrec.textContent = Math.round(precision * 100) + '%';
    elRec.textContent = Math.round(recall * 100) + '%';
    elF1.textContent = (f1).toFixed(2);
}

// Drawing
function toCanvas(x, y) {
    return {
        x: x * canvas.width,
        y: y * canvas.height
    };
}

function fromCanvas(x, y) {
    return {
        x: x / canvas.width,
        y: y / canvas.height
    };
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Regions (Gradient or Solid)
    // Complex to fill strictly one side without a polygon clip, but we can do a simple trick usually.
    // For now, let's just draw the line and points clearly.
    
    // 2. Draw Points
    points.forEach(p => {
        const pred = getPrediction(p);
        const pos = toCanvas(p.x, p.y);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, POINT_RADIUS, 0, Math.PI * 2);
        
        // Color by Actual
        // 1 = Positive (Green-ish), 0 = Negative (Blue-ish)
        if (p.actual === 1) {
            ctx.fillStyle = '#10b981'; // Green (Actual Pos)
        } else {
            ctx.fillStyle = '#3b82f6'; // Blue (Actual Neg)
        }
        
        // Stroke by Prediction Error
        if (pred !== p.actual) {
            ctx.lineWidth = 2;
            if (p.actual === 0 && pred === 1) { // FP
                ctx.strokeStyle = '#f43f5e'; // Red Ring
            } else { // FN
                ctx.strokeStyle = '#f59e0b'; // Amber Ring
            }
            ctx.stroke();
        } else {
            // Correct - gentle outline or none
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.stroke();
        }
        
        ctx.fill();
        ctx.closePath();
    });

    // 3. Draw Line handles
    const p1 = toCanvas(decisionLine.x1, decisionLine.y1);
    const p2 = toCanvas(decisionLine.x2, decisionLine.y2);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Positive Side indicator (text)
    // Find midpoint
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    // Find normal direction for text
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Orthogonal
    const dist = Math.sqrt(dx*dx + dy*dy);
    const nx = -dy / dist * 30; // 30px offset
    const ny = dx / dist * 30;
    
    // Check which side is positive by testing a point
    // We assumed prediction logic: val > 0 is 1.
    // Let's verify visual
    
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    // Let's just create a temporary point at mid + normal and see what it predicts
    const testP = fromCanvas((midX + nx)/canvas.width, (midY + ny)/canvas.height);
    const predSide = getPrediction(testP);
    
    // Draw "Predicted Positive" label on the positive side
    if (predSide === 1) {
        ctx.fillText("Predicted (+)", midX + nx, midY + ny);
        ctx.fillText("Predicted (-)", midX - nx, midY - ny);
    } else {
        ctx.fillText("Predicted (-)", midX + nx, midY + ny);
        ctx.fillText("Predicted (+)", midX - nx, midY - ny);
    }

    // Handles
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, HANDLE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

// Interaction
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return fromCanvas(evt.clientX - rect.left, evt.clientY - rect.top);
}

function dist(p1, p2) {
    return Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
}

canvas.addEventListener('mousedown', (e) => {
    const m = getMousePos(e);
    // tolerance in normalized coords (approx)
    const tol = 0.05; 
    
    if (dist(m, {x: decisionLine.x1, y: decisionLine.y1}) < tol) {
        isDragging = 'p1';
    } else if (dist(m, {x: decisionLine.x2, y: decisionLine.y2}) < tol) {
        isDragging = 'p2';
    } else {
        // Maybe drag whole line
        // Distance to segment...
        // For simplicity allow moving p1 or p2
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const m = getMousePos(e);
    
    // Clamp to 0-1
    m.x = Math.max(0, Math.min(1, m.x));
    m.y = Math.max(0, Math.min(1, m.y));
    
    if (isDragging === 'p1') {
        decisionLine.x1 = m.x;
        decisionLine.y1 = m.y;
    } else if (isDragging === 'p2') {
        decisionLine.x2 = m.x;
        decisionLine.y2 = m.y;
    }
    
    updateMetrics();
    draw();
});

window.addEventListener('mouseup', () => {
    isDragging = null;
});

resetButton.addEventListener('click', generateData);
noiseSlider.addEventListener('input', generateData);

// Init
resizeCanvas();
generateData();
