// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import './interactive.css';

export default function Interactive() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if(!container) return;

    // --- Embedded interactive script ---
    
// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const bx = 280;
const FIG_SCALE = 0.7;
const FIG_Y_OFF = 310;
let currentStep = 0;
const TOTAL_STEPS = 9;
let animFrame = null;
let scriptIsMuted = true;

// --- AUDIO ENGINE ---
let audioCtx = null;
let masterGain = null;
let noiseNode = null;
let noiseGain = null;
let oscNode = null;
let oscGain = null;
let f1, f2, f3; // Formant filters
let isAudioStarted = false;

// Helper to get CSS variables
function varColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
let waveFrame = null;
let particleList = [];
let glowParts = [];
// Hooks moved to top level

// ═══════════════════════════════════════════════════════
//  STEP DATA
// ═══════════════════════════════════════════════════════
const steps = [
  {
    id:0, icon:'🧍', title:'Meet the Speaker',
    text:'Here is a human — about to speak a word.\n\nEvery sound you make starts deep inside your body. Three key parts create your voice:\n• Lungs (air power)\n• Vocal Cords (vibration)\n• Mouth & Throat (shaping)',
    highlight:'', hColor:'',
    activeParts:[], waveType:'flat',
    params:{pitch:0,energy:0,voiced:0,spectral:0}
  },
  {
    id:1, icon:'💨', title:'Step 1 – Lungs (Air = Power)',
    text:'The lungs push air upward through the windpipe.\n\nThis airflow is the RAW ENERGY that drives everything. Without air, there is no sound!\n\nThink of it like blowing into a flute — air is the source of all sound.',
    highlight:'⚡ Air = The fuel of speech!', hColor:'rgba(79,195,247,0.15)',
    activeParts:['lungs'], waveType:'breath',
    params:{pitch:0,energy:35,voiced:0,spectral:0}
  },
  {
    id:2, icon:'🎵', title:'Step 2 – Vocal Cords (Vibration)',
    text:'As air passes through the larynx, the vocal cords VIBRATE — just like guitar strings!\n\nThis creates a buzzing tone.\n• Tight cords → HIGH pitch (like a child)\n• Loose cords → LOW pitch (like a man)\n• No vibration → unvoiced sounds (s, f, sh)',
    highlight:'🎸 Vocal cords = the guitar strings of your body!', hColor:'rgba(255,213,79,0.15)',
    activeParts:['lungs','cords'], waveType:'sine',
    params:{pitch:72,energy:60,voiced:90,spectral:0}
  },
  {
    id:3, icon:'👄', title:'Step 3 – Mouth & Throat (Shape)',
    text:'The raw buzz travels up through the throat, mouth, tongue, and lips.\n\nThese act like a FILTER — shaping the buzzy sound into specific vowels and consonants.\n\nDifferent mouth shapes = different sounds!',
    highlight:'🎭 Mouth = the sculptor that shapes raw buzz into words!', hColor:'rgba(206,147,216,0.15)',
    activeParts:['lungs','cords','mouth','throat'], waveType:'voice',
    params:{pitch:72,energy:75,voiced:90,spectral:68}
  },
  {
    id:4, icon:'🔬', title:'Step 4 – Encoder (Analysis)',
    text:'Now the VOCODER steps in!\n\nThe ENCODER listens to the speech and asks:\n• What is the PITCH? (how high/low?)\n• Is it VOICED or UNVOICED?\n• How much ENERGY is there?\n• What is the SPECTRAL SHAPE?\n\nIt extracts only these key parameters.',
    highlight:'🧠 Encoder = the smart listener that finds the essence!', hColor:'rgba(105,240,174,0.15)',
    activeParts:['lungs','cords','mouth','throat','encoder'], waveType:'analyze',
    params:{pitch:72,energy:75,voiced:90,spectral:68}
  },
  {
    id:5, icon:'📦', title:'Step 5 – Parameters (The Summary)',
    text:'Instead of sending the WHOLE waveform (thousands of samples per second), the encoder sends just 4 tiny numbers:\n\n🎵 Pitch = 120 Hz\n⚡ Energy = 0.75\n🟢 Voiced = YES\n📊 Spectral = [LPC coefficients]\n\nThis is MUCH smaller data!',
    highlight:'💡 Full signal: 64,000 bits/sec → Parameters: ~2,400 bits/sec', hColor:'rgba(255,183,77,0.15)',
    activeParts:['params'], waveType:'params',
    params:{pitch:72,energy:75,voiced:90,spectral:68}
  },
  {
    id:6, icon:'📡', title:'Step 6 – Transmission',
    text:'The tiny parameter packets are sent across the channel — phone line, radio, internet — whatever the medium.\n\nBecause the data is so small, it travels FAST and works even on low-bandwidth connections.\n\nThis is why old walkie-talkies and satellite phones sound "robotic" — they\'re using vocoders!',
    highlight:'📡 Small data → Fast travel → Less bandwidth used!', hColor:'rgba(79,195,247,0.12)',
    activeParts:['transmit'], waveType:'transmit',
    params:{pitch:72,energy:75,voiced:90,spectral:68}
  },
  {
    id:7, icon:'🏗️', title:'Step 7 – Decoder (Synthesis)',
    text:'At the receiving end, the DECODER gets the parameters and REBUILDS the speech:\n\n1. Looks at Voiced flag → picks excitation (buzz or noise)\n2. Sets the pitch of the excitation\n3. Applies the spectral filter (vocal tract shape)\n4. Out comes reconstructed speech!\n\nIt\'s like a painter recreating a portrait from just the description.',
    highlight:'🎨 Decoder = the painter who recreates speech from notes!', hColor:'rgba(206,147,216,0.15)',
    activeParts:['decoder'], waveType:'decode',
    params:{pitch:72,energy:75,voiced:90,spectral:68}
  },
  {
    id:8, icon:'🔊', title:'Step 8 – Output Speech!',
    text:'The reconstructed speech plays out of the speaker!\n\nIt sounds like the original — the same words, same pitch, same tone — but was sent using a FRACTION of the bandwidth.\n\nThis is the magic of VOCODER: \nAnalyze → Transmit → Synthesize\n\nSame message. Way less data. ✅',
    highlight:'🎉 A → T → S: Analysis, Transmission, Synthesis!', hColor:'rgba(105,240,174,0.15)',
    activeParts:['output'], waveType:'output',
    params:{pitch:72,energy:75,voiced:90,spectral:75}
  }
];

// ═══════════════════════════════════════════════════════
//  CANVAS SETUP
// ═══════════════════════════════════════════════════════
const canvas = container.querySelector('#sceneCanvas');
const ctx = canvas.getContext('2d');
const pCanvas = container.querySelector('#particles');
const pCtx = pCanvas.getContext('2d');
const wCanvas = container.querySelector('#waveCanvas');
const wCtx = wCanvas.getContext('2d');

function resizeCanvases(){
  const parent = canvas.parentElement;
  const w = parent.clientWidth;
  const availH = window.innerHeight - 130; // Shorter buffer after CSS shrinking
  
  let ratio = w / 560;
  let h = 620 * ratio;
  
  // If height is the constraint, scale based on height
  if (h > availH) {
    h = Math.max(availH, 250); // Don't go below 250px
    ratio = h / 620;
  }
  
  canvas.style.width = '100%';
  canvas.style.height = h + 'px';
  pCanvas.style.width = '100%';
  pCanvas.style.height = h + 'px';
}
resizeCanvases();
window.addEventListener('resize', resizeCanvases);

// ═══════════════════════════════════════════════════════
//  DRAW SCENE
// ═══════════════════════════════════════════════════════
let vibTime = 0;

// Part definitions: {id, label, x,y,w,h, color, glowColor}
const parts = {
  lungs:    {label:'Lungs',        x:210, y:290, w:140, h:90,  color:'#4fc3f7', glow:'rgba(79,195,247,0.6)'},
  cords:    {label:'Vocal Cords',  x:256, y:220, w:48,  h:35,  color:'#ffd54f', glow:'rgba(255,213,79,0.7)'},
  throat:   {label:'Throat',       x:252, y:170, w:56,  h:55,  color:'#ce93d8', glow:'rgba(206,147,216,0.6)'},
  mouth:    {label:'Mouth',        x:244, y:130, w:72,  h:40,  color:'#ff8a65', glow:'rgba(255,138,101,0.6)'},
  encoder:  {label:'ENCODER',      x:370, y:260, w:130, h:60,  color:'#69f0ae', glow:'rgba(105,240,174,0.6)'},
  params:   {label:'PARAMETERS',   x:370, y:355, w:130, h:60,  color:'#ffd54f', glow:'rgba(255,213,79,0.6)'},
  transmit: {label:'TRANSMIT',     x:370, y:450, w:130, h:50,  color:'#4fc3f7', glow:'rgba(79,195,247,0.6)'},
  decoder:  {label:'DECODER',      x:50,  y:450, w:130, h:50,  color:'#ce93d8', glow:'rgba(206,147,216,0.6)'},
  output:   {label:'OUTPUT 🔊',    x:50,  y:355, w:130, h:50,  color:'#69f0ae', glow:'rgba(105,240,174,0.7)'},
};

// ── DRAWING HELPERS (Premium) ──
function drawGlassBox(ctx, x, y, w, h, label, icon, active, color, glow, t) {
  ctx.save();
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if(active){
    grad.addColorStop(0, 'rgba(30, 40, 70, 0.9)');
    grad.addColorStop(1, 'rgba(10, 15, 30, 0.95)');
    ctx.shadowColor = glow;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
  }
  
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.stroke();
  
  // Inner shine
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.roundRect(x+2, y+2, w-4, h-4, 10);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = active ? color : 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 12px Syne';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w/2, y + h - 14);
  
  ctx.font = '18px serif';
  ctx.fillText(icon, x + w/2, y + 28);
  ctx.restore();
}

function drawHuman(step, t) {
  ctx.clearRect(0, 0, 560, 620);

  const s = steps[step];
  const active = s.activeParts;

  // ── BACKGROUND GRID ──
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for(let x=0;x<560;x+=40){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,620);ctx.stroke();
  }
  for(let y=0;y<620;y+=40){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(560,y);ctx.stroke();
  }

  // ── HUMAN FIGURE ──
  // Body center at bx=280 (now global)
  
  ctx.save();
  ctx.translate(bx, FIG_Y_OFF);
  ctx.scale(FIG_SCALE, FIG_SCALE);
  ctx.translate(-bx, -FIG_Y_OFF);

  // Torso - Multi-layered gradient
  const torsoGrad = ctx.createLinearGradient(bx-55, 200, bx+55, 420);
  torsoGrad.addColorStop(0, '#1a1a2e');
  torsoGrad.addColorStop(1, '#0f0f1a');
  ctx.fillStyle = torsoGrad;
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx-55, 200, 110, 220, 16);
  ctx.fill(); ctx.stroke();

  // Highlight on torso
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.roundRect(bx-50, 205, 100, 210, 14);
  ctx.stroke();

  // Neck
  ctx.fillStyle = '#161625';
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(bx-16, 155, 32, 50, 6);
  ctx.fill(); ctx.stroke();
  // Neck detail
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for(let i=0;i<3;i++){
    ctx.beginPath(); ctx.moveTo(bx-12, 165+i*12); ctx.lineTo(bx+12, 165+i*12); ctx.stroke();
  }

  // Head
  const headGlow = active.includes('mouth') || active.includes('throat');
  if(headGlow){
    ctx.shadowColor = parts.mouth.glow;
    ctx.shadowBlur = 25;
  }
  const headGrad = ctx.createRadialGradient(bx-15, 95, 10, bx, 110, 60);
  headGrad.addColorStop(0, '#252545');
  headGrad.addColorStop(1, '#121225');
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = headGlow ? '#ff8a65' : 'rgba(255,255,255,0.2)';
  ctx.lineWidth = headGlow ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.ellipse(bx, 110, 48, 58, 0, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = headGlow ? 10 : 0;
  // Inner head rim
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath(); ctx.ellipse(bx, 110, 44, 54, 0, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0;

  // Face details
  // Eyes
  const eyePulse = 0.5 + Math.sin(t*0.05)*0.2;
  ctx.shadowColor = '#00d2ff';
  ctx.shadowBlur = 10 * eyePulse;
  ctx.fillStyle = '#00d2ff';
  ctx.beginPath(); ctx.ellipse(bx-18, 98, 6, 7, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bx+18, 98, 6, 7, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(bx-16, 96, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(bx+20, 96, 2, 2.5, 0, 0, Math.PI*2); ctx.fill();

  // Mouth (animated if active)
  const mouthOpen = active.includes('mouth') ? Math.max(2, Math.abs(Math.sin(t*0.08))*10) : 3;
  ctx.strokeStyle = active.includes('mouth') ? '#ff8a65' : 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if(active.includes('mouth')){
    ctx.ellipse(bx, 135, 12, mouthOpen, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255, 138, 101, 0.2)';
    ctx.fill();
  } else {
    ctx.arc(bx, 130, 12, 0.2*Math.PI, 0.8*Math.PI);
  }
  ctx.stroke();

  // Arms & Legs - More detailed 
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth=16; ctx.lineCap='round';
  // Arms
  ctx.beginPath(); ctx.moveTo(bx-55, 230); ctx.lineTo(bx-95, 340); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx+55, 230); ctx.lineTo(bx+95, 340); ctx.stroke();
  // Legs
  ctx.beginPath(); ctx.moveTo(bx-28,420); ctx.lineTo(bx-35,550); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx+28,420); ctx.lineTo(bx+35,550); ctx.stroke();

  // ── LUNGS ──
  const lungsActive = active.includes('lungs');
  const lungScale = lungsActive ? 1 + Math.sin(t*0.06)*0.08 : 1;
  ctx.save();
  ctx.translate(bx, 310);
  ctx.scale(lungScale, lungScale);
  if(lungsActive){ ctx.shadowColor = parts.lungs.glow; ctx.shadowBlur = 25; }
  // Left lung
  ctx.fillStyle = lungsActive ? 'rgba(79,195,247,0.25)' : 'rgba(79,195,247,0.08)';
  ctx.strokeStyle = lungsActive ? '#4fc3f7' : 'rgba(79,195,247,0.3)';
  ctx.lineWidth = lungsActive ? 2 : 1;
  ctx.beginPath();
  ctx.ellipse(-28, 0, 22, 38, -0.2, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  // Right lung
  ctx.beginPath();
  ctx.ellipse(28, 0, 22, 38, 0.2, 0, Math.PI*2);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
  if(lungsActive){
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('LUNGS', bx, 370);
  }

  // Air flow particles from lungs upward
  if(lungsActive){
    for(let i=0;i<3;i++){
      const yOff = ((t*2 + i*30) % 90);
      const alpha = 0.6 - yOff/90;
      ctx.fillStyle = `rgba(79,195,247,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(bx + Math.sin(t*0.1+i)*8, 345-yOff, 3, 5, 0, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // ── VOCAL CORDS ──
  const cordsActive = active.includes('cords');
  if(cordsActive){ ctx.shadowColor = parts.cords.glow; ctx.shadowBlur = 22; }
  const vibAmp = cordsActive ? Math.sin(t*0.25)*4 : 0;
  ctx.strokeStyle = cordsActive ? '#ffd54f' : 'rgba(255,213,79,0.25)';
  ctx.lineWidth = cordsActive ? 3 : 1.5;
  // Left cord
  ctx.beginPath();
  ctx.moveTo(bx-20, 235);
  ctx.quadraticCurveTo(bx, 240+vibAmp, bx-20, 245);
  ctx.stroke();
  // Right cord
  ctx.beginPath();
  ctx.moveTo(bx+20, 235);
  ctx.quadraticCurveTo(bx, 240-vibAmp, bx+20, 245);
  ctx.stroke();
  // Center gap
  ctx.fillStyle = cordsActive ? `rgba(255,213,79,${0.3+Math.abs(Math.sin(t*0.25))*0.4})` : 'rgba(255,213,79,0.05)';
  ctx.beginPath();
  ctx.ellipse(bx, 240, 8, 6+Math.abs(vibAmp*0.5), 0, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  if(cordsActive){
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 10px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('VOCAL CORDS', bx, 258);
  }

  // ── THROAT ──
  const throatActive = active.includes('throat');
  if(throatActive){ ctx.shadowColor = parts.throat.glow; ctx.shadowBlur = 18; }
  ctx.strokeStyle = throatActive ? '#ce93d8' : 'rgba(206,147,216,0.2)';
  ctx.lineWidth = throatActive ? 2.5 : 1;
  // Throat lines
  ctx.beginPath();
  ctx.moveTo(bx-14, 165); ctx.lineTo(bx-14, 235); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx+14, 165); ctx.lineTo(bx+14, 235); ctx.stroke();
  // Rings
  for(let r=0;r<4;r++){
    const ry = 175 + r*14;
    const wave = throatActive ? Math.sin(t*0.1+r)*3 : 0;
    ctx.beginPath();
    ctx.ellipse(bx, ry, 14+wave, 5, 0, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  if(throatActive){
    ctx.fillStyle = '#ce93d8';
    ctx.font = 'bold 10px Nunito';
    ctx.textAlign = 'center';
    ctx.fillText('THROAT', bx+45, 195);
  }

  ctx.restore(); // End human scaling

  // ── ENCODER BOX ──
  const encActive = active.includes('encoder');
  drawGlassBox(ctx, 360, 250, 145, 65, 'ENCODER', '⚙️', encActive, varColor('--accent-green'), 'rgba(0,255,135,0.3)', t);
  if(encActive){
    const startX = bx + (56 * FIG_SCALE);
    const startY = FIG_Y_OFF + ((280 - FIG_Y_OFF) * FIG_SCALE);
    drawArrow(ctx, startX, startY, 358, 282, varColor('--accent-green'), t);
  }

  // ── PARAMS BOX ──
  const parActive = active.includes('params');
  drawGlassBox(ctx, 360, 345, 145, 58, 'PARAMETERS', '📦', parActive, varColor('--accent-gold'), 'rgba(255,234,0,0.3)', t);
  if(parActive){
    drawArrow(ctx, 433, 316, 433, 343, '#ffd54f', t);
    // Mini param pills
    const pills = [{l:'PITCH',c:'#4fc3f7'},{l:'ENERGY',c:'#ffb74d'},{l:'VOICED',c:'#69f0ae'},{l:'LPC',c:'#ce93d8'}];
    pills.forEach((p,i)=>{
      const px = 363 + i*36;
      ctx.fillStyle = p.c+'30';
      ctx.strokeStyle = p.c;
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(px, 390, 34, 16, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.c;
      ctx.font = 'bold 7px Space Mono';
      ctx.textAlign = 'center';
      ctx.fillText(p.l, px+17, 402);
    });
  }

  // ── TRANSMIT BOX ──
  const txActive = active.includes('transmit');
  drawGlassBox(ctx, 360, 435, 145, 52, 'TRANSMIT', '📡', txActive, varColor('--accent-blue'), 'rgba(0,210,255,0.3)', t);
  if(txActive){
    drawArrow(ctx, 433, 404, 433, 433, varColor('--accent-blue'), t);
    // Radio waves
    for(let w=1;w<=3;w++){
      const alpha = (Math.sin(t*0.08 - w*0.5)+1)*0.5 * 0.6;
      ctx.strokeStyle = `rgba(0,210,255,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(433, 461, w*18, -Math.PI*0.8, -Math.PI*0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(433, 461, w*18, Math.PI*0.2, Math.PI*0.8);
      ctx.stroke();
    }
  }

  // ── DECODER BOX ──
  const decActive = active.includes('decoder');
  drawGlassBox(ctx, 50, 435, 145, 52, 'DECODER', '🏗️', decActive, varColor('--accent-purple'), 'rgba(157,80,187,0.3)', t);
  if(decActive){
    // Curved path from transmit to decoder
    ctx.strokeStyle = varColor('--accent-purple');
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8,6]);
    ctx.beginPath();
    ctx.moveTo(433, 488);
    ctx.bezierCurveTo(433, 525, 123, 525, 123, 488);
    ctx.stroke();
    ctx.setLineDash([]);
    // Arrow head
    ctx.fillStyle = varColor('--accent-purple');
    ctx.beginPath();
    ctx.moveTo(123, 488);
    ctx.lineTo(116, 500); ctx.lineTo(130, 500);
    ctx.fill();
  }

  // ── OUTPUT BOX ──
  const outActive = active.includes('output');
  drawGlassBox(ctx, 50, 345, 145, 52, 'OUTPUT 🔊', '🎶', outActive, varColor('--accent-green'), 'rgba(0,255,135,0.4)', t);
  if(outActive){
    drawArrow(ctx, 123, 433, 123, 398, varColor('--accent-green'), t);
    // Sound waves out
    for(let w=1;w<=4;w++){
      const alpha = (Math.sin(t*0.1 - w*0.4)+1)*0.5*0.7;
      ctx.strokeStyle = `rgba(0,255,135,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(50, 371, w*16, -Math.PI*0.6, Math.PI*0.6);
      ctx.stroke();
    }
  }

  // ── STEP LABEL ──
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.font = '900 100px Syne';
  ctx.textAlign = 'right';
  ctx.fillText(String(step).padStart(2,'0'), 545, 600);
  ctx.textAlign = 'left';
}

// function drawBox remains removed as it's replaced by drawGlassBox

function drawArrow(ctx, x1, y1, x2, y2, color, t){
  const pulse = (Math.sin(t*0.12)+1)*0.5;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5,4]);
  ctx.lineDashOffset = -t * 0.5;
  ctx.globalAlpha = 0.5 + pulse * 0.5;
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  ctx.globalAlpha = 1;
  // Arrowhead
  const angle = Math.atan2(y2-y1, x2-x1);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 10*Math.cos(angle-0.4), y2 - 10*Math.sin(angle-0.4));
  ctx.lineTo(x2 - 10*Math.cos(angle+0.4), y2 - 10*Math.sin(angle+0.4));
  ctx.fill();
}

// ═══════════════════════════════════════════════════════
//  WAVEFORM CANVAS
// ═══════════════════════════════════════════════════════
let waveT = 0;
function drawWave() {
  wCtx.clearRect(0, 0, 400, 80);
  wCtx.fillStyle = 'rgba(0,0,0,0.3)';
  wCtx.fillRect(0,0,400,80);

  const type = steps[currentStep].waveType;
  const midY = 40;
  const w = 400;

  wCtx.beginPath();
  wCtx.strokeStyle = getWaveColor(type);
  wCtx.lineWidth = 2;
  wCtx.shadowColor = getWaveColor(type);
  wCtx.shadowBlur = 6;

  for(let x=0;x<w;x++){
    const t = x/w;
    let y = midY;
    if(type === 'flat') y = midY + Math.sin(x*0.5 + waveT*0.05)*1;
    else if(type === 'breath') y = midY + Math.sin(x*0.08 + waveT*0.03) * 12 * Math.sin(t*Math.PI);
    else if(type === 'sine') y = midY + Math.sin(x*0.25 + waveT*0.2)*22;
    else if(type === 'voice') {
      y = midY + (Math.sin(x*0.25+waveT*0.2)*18 + Math.sin(x*0.5+waveT*0.15)*7 + Math.sin(x*0.1+waveT*0.08)*5);
    }
    else if(type === 'analyze') {
      y = midY + (Math.sin(x*0.25+waveT*0.2)*18 + Math.sin(x*0.5+waveT*0.15)*7);
      if(Math.floor(x/40)%2===0){ wCtx.strokeStyle='#69f0ae'; } else { wCtx.strokeStyle='#ffd54f'; }
    }
    else if(type === 'params') {
      // Blocky parametric
      const seg = Math.floor(x/50);
      const amps = [18,12,22,8,15,16,20,10];
      y = midY + Math.sin(x*0.3+waveT*0.2)*(amps[seg%8]);
    }
    else if(type === 'transmit') {
      // Dotted/sparse
      if(Math.floor(x/8)%3 !== 0) y = midY + Math.sin(x*0.3+waveT*0.2)*15;
      else y = midY;
    }
    else if(type === 'decode') {
      y = midY + (Math.sin(x*0.25+waveT*0.22)*16 + Math.sin(x*0.48+waveT*0.14)*6);
    }
    else if(type === 'output') {
      y = midY + (Math.sin(x*0.25+waveT*0.2)*20 + Math.sin(x*0.5+waveT*0.15)*8 + Math.sin(x*0.12+waveT*0.07)*4);
    }
    if(x===0) wCtx.moveTo(x,y); else wCtx.lineTo(x,y);
  }
  wCtx.stroke();
  wCtx.shadowBlur = 0;

  // Label
  const labels = {flat:'Silence',breath:'Air Flow',sine:'Raw Vibration',voice:'Speech Signal',
    analyze:'Analyzing...',params:'Parameters',transmit:'Transmitted',decode:'Reconstructing',output:'Output Speech'};
  wCtx.fillStyle = 'rgba(255,255,255,0.3)';
  wCtx.font = '10px Space Mono';
  wCtx.textAlign = 'right';
  wCtx.fillText(labels[type]||'', 395, 74);

  waveT++;
  waveFrame = requestAnimationFrame(drawWave);
}

function getWaveColor(type){
  const map = {
    flat:'#607d8b',
    breath:varColor('--accent-blue'),
    sine:varColor('--accent-gold'),
    voice:varColor('--accent-purple'),
    analyze:varColor('--accent-green'),
    params:varColor('--accent-orange'),
    transmit:varColor('--accent-blue'),
    decode:varColor('--accent-purple'),
    output:varColor('--accent-green')
  };
  return map[type] || varColor('--accent-blue');
}

// ═══════════════════════════════════════════════════════
//  MAIN ANIMATION LOOP
// ═══════════════════════════════════════════════════════
function animate(){
  vibTime++;
  drawHuman(currentStep, vibTime);
  updateParticles();
  animFrame = requestAnimationFrame(animate);
}

// ═══════════════════════════════════════════════════════
//  PARTICLES
// ═══════════════════════════════════════════════════════
function spawnParticles(step){
  const col = [
    varColor('--accent-blue'),
    varColor('--accent-gold'),
    varColor('--accent-green'),
    varColor('--accent-purple'),
    varColor('--accent-orange')
  ][step % 5];

  for(let i=0;i<25;i++){
    particleList.push({
      x: 280 + (Math.random()-0.5)*100,
      y: 350 + (Math.random()-0.5)*150,
      vx: (Math.random()-0.5)*2.5,
      vy: -1 - Math.random()*2,
      r: 1.5 + Math.random()*3.5,
      color: col,
      life: 1.0,
      decay: 0.01 + Math.random()*0.015,
      glow: true
    });
  }
}

function updateParticles(){
  pCtx.clearRect(0, 0, 560, 620);
  particleList = particleList.filter(p => p.life > 0);
  particleList.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.02; // Reduced gravity for more "floaty" feel
    p.life -= p.decay;
    
    pCtx.globalAlpha = p.life;
    if(p.glow){
      pCtx.shadowBlur = 8;
      pCtx.shadowColor = p.color;
    }
    pCtx.fillStyle = p.color;
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    pCtx.fill();
    pCtx.shadowBlur = 0;
  });
  pCtx.globalAlpha = 1;
}

// ── AUDIO CONTROL ──
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.connect(audioCtx.destination);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);

  // Noise generator for breath
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
  
  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;
  
  noiseGain = audioCtx.createGain();
  noiseGain.gain.value = 0;
  
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 1200;

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseNode.start();

  // Vocal Source (Oscillator)
  oscNode = audioCtx.createOscillator();
  oscNode.type = 'sawtooth';
  oscNode.frequency.value = 115; // Natural male pitch
  
  oscGain = audioCtx.createGain();
  oscGain.gain.value = 0;
  oscNode.connect(oscGain);

  // Formant Filter Bank (Parallel)
  f1 = audioCtx.createBiquadFilter(); f1.type = 'bandpass';
  f2 = audioCtx.createBiquadFilter(); f2.type = 'bandpass';
  f3 = audioCtx.createBiquadFilter(); f3.type = 'bandpass';
  
  oscGain.connect(f1); oscGain.connect(f2); oscGain.connect(f3);
  f1.connect(masterGain); f2.connect(masterGain); f3.connect(masterGain);
  
  oscNode.start();
  isAudioStarted = true;
}

function updateAudio(step) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  
  // Reset gains
  noiseGain.gain.setTargetAtTime(0, now, 0.1);
  oscGain.gain.setTargetAtTime(0, now, 0.1);
  masterGain.gain.setTargetAtTime(0.25, now, 0.1);

  if (step === 0) {
    masterGain.gain.setTargetAtTime(0, now, 0.1);
  } else if (step === 1) { // Lungs
    noiseGain.gain.setTargetAtTime(0.3, now, 0.1);
  } else if (step === 2) { // Cords
    oscGain.gain.setTargetAtTime(0.4, now, 0.1);
    // Neutral filter
    f1.frequency.setTargetAtTime(500, now, 0.1); f1.Q.value = 1;
    f2.frequency.setTargetAtTime(1500, now, 0.1); f2.Q.value = 1;
    f3.frequency.setTargetAtTime(2500, now, 0.1); f3.Q.value = 1;
  } else if (step === 3 || step === 8) { // Mouth / Output (Vowel "ah")
    oscGain.gain.setTargetAtTime(0.4, now, 0.1);
    // Human vowel "ah" formants
    f1.frequency.setTargetAtTime(730, now, 0.2); f1.Q.setTargetAtTime(10, now, 0.2);
    f2.frequency.setTargetAtTime(1090, now, 0.2); f2.Q.setTargetAtTime(10, now, 0.2);
    f3.frequency.setTargetAtTime(2440, now, 0.2); f3.Q.setTargetAtTime(10, now, 0.2);
    oscNode.frequency.setTargetAtTime(120 + Math.sin(now*5)*2, now, 0.2); // Vibrato
  } else if (step >= 4 && step <= 7) { // Digital
    oscGain.gain.setTargetAtTime(0.2, now, 0.1);
    const f = 400 + (step * 100);
    f1.frequency.setTargetAtTime(f, now, 0.1); f1.Q.value = 5;
    f2.frequency.setTargetAtTime(f*1.5, now, 0.1); f2.Q.value = 5;
    f3.frequency.setTargetAtTime(f*2, now, 0.1); f3.Q.value = 5;
    oscNode.frequency.setTargetAtTime(f/2, now, 0.1);
  }
}

// ═══════════════════════════════════════════════════════
//  UPDATE UI
// ═══════════════════════════════════════════════════════
function updateUI(step, skipParticles){
  const s = steps[step];

  // Story box
  container.querySelector('#storyIcon').textContent = s.icon;
  container.querySelector('#storyTitle').textContent = s.title;
  container.querySelector('#storyText').textContent = s.text;

  const hl = container.querySelector('#storyHighlight');
  if(s.highlight){
    hl.style.display = 'block';
    hl.textContent = s.highlight;
    hl.style.background = s.hColor;
    hl.style.color = '#fff';
    hl.style.border = '1px solid ' + s.hColor.replace('0.15','0.4').replace('0.12','0.35');
  } else {
    hl.style.display = 'none';
  }

  // Param bars
  const pb = container.querySelector('#paramBox');
  if(step >= 4){
    pb.style.display = 'flex';
    animateBar('pPitch','vPitch', s.params.pitch, '120Hz');
    animateBar('pEnergy','vEnergy', s.params.energy, '0.75');
    animateBar('pVoiced','vVoiced', s.params.voiced, 'YES');
    animateBar('pSpectral','vSpectral', s.params.spectral, 'LPC');
  } else {
    pb.style.display = 'none';
  }

  // Step chips
  container.querySelectorAll('.step-chip').forEach((c,i) => {
    c.classList.remove('active','done');
    if(i === step) c.classList.add('active');
    else if(i < step) c.classList.add('done');
  });

  // Button
  const btn = container.querySelector('#btnNext');
  if(step === TOTAL_STEPS-1){
    btn.textContent = '🎉 Complete! Reset →';
  } else {
    btn.textContent = 'Next Step →';
  }

  // Particles
  if(!skipParticles && step > 0) spawnParticles(step);

  // Audio
  if (!scriptIsMuted) {
    if (!audioCtx) initAudio();
    updateAudio(step);
  } else if (audioCtx && masterGain) {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  }
}

function animateBar(barId, valId, targetPct, label){
  const bar = container.querySelector('#' + barId);
  const val = container.querySelector('#' + valId);
  if(!bar) return;
  bar.style.width = '0%';
  val.textContent = '--';
  setTimeout(()=>{
    bar.style.width = targetPct + '%';
    val.textContent = targetPct > 0 ? label : '--';
  }, 300);
}

// ═══════════════════════════════════════════════════════
//  CANVAS CLICK (hotspots)
// ═══════════════════════════════════════════════════════
canvas.addEventListener('click', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const scaleX = 560 / rect.width;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleX;

  // Ripple
  const rip = document.createElement('div');
  rip.className = 'ripple';
  rip.style.left = e.clientX - rect.left + 'px';
  rip.style.top  = e.clientY - rect.top + 'px';
  canvas.parentElement.appendChild(rip);
  setTimeout(()=>rip.remove(), 700);

  // Map click to steps
  // Map click to steps
    const clickMap = [
      {x: bx + (220-bx)*FIG_SCALE, y: FIG_Y_OFF + (280-FIG_Y_OFF)*FIG_SCALE, w: 120*FIG_SCALE, h: 100*FIG_SCALE, step:1},  // lungs
      {x: bx + (248-bx)*FIG_SCALE, y: FIG_Y_OFF + (225-FIG_Y_OFF)*FIG_SCALE, w: 64*FIG_SCALE, h: 35*FIG_SCALE,  step:2},  // cords
      {x: bx + (240-bx)*FIG_SCALE, y: FIG_Y_OFF + (140-FIG_Y_OFF)*FIG_SCALE, w: 80*FIG_SCALE, h: 90*FIG_SCALE,  step:3},  // mouth/throat/head
      {x:355,y:245,w:155,h:75, step:4},  // encoder
      {x:355,y:340,w:155,h:70, step:5},  // params
      {x:355,y:430,w:155,h:65, step:6},  // transmit
      {x:45, y:430,w:155,h:65, step:7},  // decoder
      {x:45, y:340,w:155,h:65, step:8},  // output
    ];

  for(const z of clickMap){
    if(cx >= z.x && cx <= z.x+z.w && cy >= z.y && cy <= z.y+z.h){
      currentStep = z.step;
      updateUI(currentStep);
      return;
    }
  }
});

// Touch support
canvas.addEventListener('touchend', (e)=>{
  e.preventDefault();
  const touch = e.changedTouches[0];
  canvas.dispatchEvent(new MouseEvent('click', {clientX:touch.clientX, clientY:touch.clientY}));
},{passive:false});

// Change cursor when hovering hotspot
canvas.addEventListener('mousemove',(e)=>{
  const rect = canvas.getBoundingClientRect();
  const scaleX = 560/rect.width;
  const cx = (e.clientX-rect.left)*scaleX;
  const cy = (e.clientY-rect.top)*scaleX;
    const zones = [
      {x: bx + (220-bx)*FIG_SCALE, y: FIG_Y_OFF + (280-FIG_Y_OFF)*FIG_SCALE, w: 120*FIG_SCALE, h: 100*FIG_SCALE},
      {x: bx + (248-bx)*FIG_SCALE, y: FIG_Y_OFF + (225-FIG_Y_OFF)*FIG_SCALE, w: 64*FIG_SCALE, h: 35*FIG_SCALE},
      {x: bx + (240-bx)*FIG_SCALE, y: FIG_Y_OFF + (140-FIG_Y_OFF)*FIG_SCALE, w: 80*FIG_SCALE, h: 90*FIG_SCALE},
      {x:355,y:245,w:155,h:75},
      {x:355,y:340,w:155,h:70},
      {x:355,y:430,w:155,h:65},
      {x:45,y:430,w:155,h:65},
      {x:45,y:340,w:155,h:65}
    ];
  const hit = zones.some(z=>cx>=z.x&&cx<=z.x+z.w&&cy>=z.y&&cy<=z.y+z.h);
  canvas.style.cursor = hit ? 'pointer' : 'default';
});

// ═══════════════════════════════════════════════════════
//  BUTTONS
// ═══════════════════════════════════════════════════════
container.querySelector('#btnNext').addEventListener('click', ()=>{
  if(currentStep < TOTAL_STEPS-1){
    currentStep++;
    updateUI(currentStep);
  } else {
    resetAll();
  }
});

container.querySelector('#btnReset').addEventListener('click', resetAll);

container.querySelector('#btnMute').addEventListener('click', () => {
  scriptIsMuted = !scriptIsMuted;
  container.querySelector('#btnMute').textContent = scriptIsMuted ? '🔇 Unmute' : '🔊 Mute';
  if (!scriptIsMuted) {
    if (!audioCtx) initAudio();
    updateAudio(currentStep);
  } else if (audioCtx && masterGain) {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  }
});

container.querySelectorAll('.step-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const s = parseInt(chip.dataset.step);
    currentStep = s;
    updateUI(currentStep, true);
  });
});

function resetAll(){
  currentStep = 0;
  particleList = [];
  updateUI(0, true);
}

// ═══════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════
updateUI(0, true);
animate();
drawWave();

    // --- End embedded ---

    return () => {
      if(typeof animFrame !== 'undefined' && animFrame) cancelAnimationFrame(animFrame);
      if(typeof waveFrame !== 'undefined' && waveFrame) cancelAnimationFrame(waveFrame);
      if(audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    };
  }, []);

  return (
    <div className="interactive-container" ref={containerRef}>

{/* ── STAGE: Canvas fills center ── */}
<div id="interactiveStage">
  <div id="scene">
    <canvas id="sceneCanvas" width="560" height="620"></canvas>
    <canvas id="particles" width="560" height="620"></canvas>
  </div>

  {/* Floating Story Panel — right side overlay */}
  <div id="storyBox">
    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
      <span id="storyIcon" style={{fontSize:'1.4rem'}}>🎯</span>
      <span id="storyTitle" style={{fontWeight:700,fontSize:'0.95rem'}}>Welcome to VOCODER!</span>
    </div>
    <div id="storyText" style={{fontSize:'0.82rem',lineHeight:1.5,color:'#ccd6f6'}}>
      Click "Next Step →" or tap any glowing part to begin!
    </div>
    <div id="storyHighlight"></div>
  </div>
</div>

{/* ── BOTTOM PANEL: All controls in a horizontal strip ── */}
<div id="bottomPanel">

  {/* Step Chips — scrollable horizontal nav like thumbnail bar */}
  <div id="stepBar">
    <div className="step-chip active" data-step="0">① Start</div>
    <div className="step-chip" data-step="1">② Lungs</div>
    <div className="step-chip" data-step="2">③ Vocal Cords</div>
    <div className="step-chip" data-step="3">④ Mouth/Throat</div>
    <div className="step-chip" data-step="4">⑤ Encoder</div>
    <div className="step-chip" data-step="5">⑥ Parameters</div>
    <div className="step-chip" data-step="6">⑦ Transmit</div>
    <div className="step-chip" data-step="7">⑧ Decoder</div>
    <div className="step-chip" data-step="8">⑨ Output</div>
  </div>

  {/* Info Row — waveform, params, buttons side by side */}
  <div id="infoRow">

    <div id="signalBox">
      <h3>🌊 Waveform</h3>
      <canvas id="waveCanvas" width="400" height="80"></canvas>
    </div>

    <div id="paramBox">
      <h3>📊 Params</h3>
      <div className="param-row">
        <div className="param-label">PITCH</div>
        <div className="param-bar-bg"><div className="param-bar" id="pPitch" style={{background: 'var(--accent)'}}></div></div>
        <div className="param-val" id="vPitch" style={{color: 'var(--accent)'}}>--</div>
      </div>
      <div className="param-row">
        <div className="param-label">ENERGY</div>
        <div className="param-bar-bg"><div className="param-bar" id="pEnergy" style={{background: 'var(--gold)'}}></div></div>
        <div className="param-val" id="vEnergy" style={{color: 'var(--gold)'}}>--</div>
      </div>
      <div className="param-row">
        <div className="param-label">VOICED</div>
        <div className="param-bar-bg"><div className="param-bar" id="pVoiced" style={{background: 'var(--green)'}}></div></div>
        <div className="param-val" id="vVoiced" style={{color: 'var(--green)'}}>--</div>
      </div>
      <div className="param-row">
        <div className="param-label">SPECTRAL</div>
        <div className="param-bar-bg"><div className="param-bar" id="pSpectral" style={{background: 'var(--purple)'}}></div></div>
        <div className="param-val" id="vSpectral" style={{color: 'var(--purple)'}}>--</div>
      </div>
    </div>

    <div id="btnArea">
      <button id="btnNext">Next Step →</button>
      <button id="btnMute">🔇 Unmute</button>
      <button id="btnReset">↺ Reset</button>
    </div>
  </div>

</div>

    </div>
  );
}

