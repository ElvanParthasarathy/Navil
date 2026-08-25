import React, { useState, useEffect, useRef } from 'react';
import { convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';
import { DownloadSimple, Image as ImageIcon } from '@phosphor-icons/react';

type ScriptType = 'brahmi' | 'vatteluttu';

export function ArichuvadiImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [textInput, setTextInput] = useState('ஜினவாணி');
  const [color, setColor] = useState('#2469E0');
  const [fontSize, setFontSize] = useState(100);
  
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [textPos, setTextPos] = useState({ x: 50, y: 150 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBgImage(img);
        // Reset text position to centerish
        setTextPos({ x: img.width / 4, y: img.height / 2 });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getConvertedText = () => {
    return script === 'brahmi' ? convertToBrahmi(textInput, 'late') : convertToVatteluttu(textInput);
  };

  const getFontFamily = () => {
    return script === 'brahmi' ? 'Adinatha-Tamil-Brahmi' : 'e-Velvi';
  };

  // Redraw canvas whenever anything changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    if (bgImage) {
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;
    } else {
      canvas.width = 600;
      canvas.height = 400;
    }

    // Clear and draw bg
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0);
    } else {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#aaa';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('படம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை (No Image)', canvas.width/2, canvas.height/2);
    }

    // Draw text
    if (textInput) {
      const displayTxt = getConvertedText();
      
      // We must make sure fonts are loaded in the browser, 
      // but since they are in CSS they should be available.
      ctx.font = `${fontSize}px "${getFontFamily()}"`;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(displayTxt, textPos.x, textPos.y);
    }
  }, [bgImage, textInput, script, color, fontSize, textPos]);

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scale factor between visual CSS size and actual canvas coordinate size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Very rough hit testing for text block
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.font = `${fontSize}px "${getFontFamily()}"`;
      const metrics = ctx.measureText(getConvertedText());
      const textWidth = metrics.width;
      const textHeight = fontSize; // rough approx

      if (
        clickX >= textPos.x && clickX <= textPos.x + textWidth &&
        clickY >= textPos.y && clickY <= textPos.y + textHeight
      ) {
        setIsDragging(true);
        setDragOffset({ x: clickX - textPos.x, y: clickY - textPos.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setTextPos({
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'navil-inscription.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="animate-entry" style={{ marginTop: '30px', padding: '0 16px', maxWidth: '1000px', margin: '30px auto' }}>
      
      <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImageIcon weight="fill" color="var(--text-main)" /> பட உரை (Image Overlay)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          தாங்கள் விரும்பும் படத்தில் தமிழ்-பிராமி அல்லது வட்டெழுத்து உரையை சேர்க்க. முதலில் படத்தை தேர்வு செய்யவும், பிறகு உரையினை உள்ளிடுக, இறுதியாக நிறத்தை தேர்வு செய்க. உரையை இழுத்து (Drag) தேவையான இடத்தில் வைக்கலாம்.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div className="arichuvadi-select-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>1. படம் (Image):</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%' }} />
          </div>

          <div className="arichuvadi-select-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>2. உரை (Text):</label>
            <input 
              type="text" 
              className="arichuvadi-select" 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              placeholder="தமிழில் உள்ளிடுக"
              style={{ width: '100%' }}
            />
          </div>

          <div className="arichuvadi-select-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>3. எழுத்து (Script):</label>
            <select className="arichuvadi-select" value={script} onChange={(e) => setScript(e.target.value as ScriptType)} style={{ width: '100%' }}>
              <option value="brahmi">தமிழி (Thamizhi)</option>
              <option value="vatteluttu">வட்டெழுத்து (Vatteluttu)</option>
            </select>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div className="arichuvadi-select-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>நிறம் (Color):</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '50px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
          </div>

          <div className="arichuvadi-select-wrap" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <label style={{ marginBottom: '8px' }}>அளவு (Size): {fontSize}px</label>
            <input type="range" min="20" max="300" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
          
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="arichuvadi-btn" 
            onClick={downloadImage}
            disabled={!bgImage}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: bgImage ? 1 : 0.5 }}
          >
            <DownloadSimple weight="bold" /> Download Image
          </button>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--bg-panel)' }}>
        <canvas 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            maxWidth: '100%', 
            height: 'auto', 
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'block',
            margin: '0 auto'
          }}
        />
      </div>

    </div>
  );
}
