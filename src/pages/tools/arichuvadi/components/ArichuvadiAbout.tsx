import React from 'react';
import { Info, Code, User, Copyright } from '@phosphor-icons/react';

export function ArichuvadiAbout() {
  return (
    <div className="animate-entry" style={{ marginTop: '30px', padding: '0 16px', maxWidth: '800px', margin: '30px auto' }}>
      
      <div style={{ background: 'var(--bg-panel)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 0, marginBottom: '24px' }}>
          <Info weight="fill" color="var(--text-main)" /> நவில் அரிச்சுவடி பற்றி (About)
        </h2>
        
        <p style={{ lineHeight: '1.8', marginBottom: '16px' }}>
          <strong>நவில் அரிச்சுவடி (Navil Arichuvadi)</strong> என்பது பண்டைய தமிழ் எழுத்துக்களான <strong>தமிழி (Thamizhi / Tamil-Brahmi)</strong> மற்றும் <strong>வட்டெழுத்து (Vatteluttu)</strong> ஆகியவற்றைப் பயிலவும், பயன்படுத்தவும் உருவாக்கப்பட்ட ஒரு முழுமையான மென்பொருள் கருவியாகும்.
        </p>
        
        <p style={{ lineHeight: '1.8', marginBottom: '16px' }}>
          இது நவீன தமிழ் உரைகளை பண்டைய எழுத்துக்களாக மாற்றுவது மட்டுமல்லாமல், அவற்றை எளிதாகப் படிப்பதற்கான பயிற்சி விளையாட்டுகள், நூல்கள் மற்றும் பிற கருவிகளையும் உள்ளடக்கியது.
        </p>
      </div>

      <div style={{ background: 'var(--bg-panel)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 0, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Copyright weight="fill" /> உரிமம் மற்றும் கடப்பாடு (Attribution & License)
        </h3>
        
        <p style={{ lineHeight: '1.8', marginBottom: '24px' }}>
          இந்த மென்பொருளின் அடிப்படை மாற்று இயந்திரம் (Core Transliteration Engine) மற்றும் எழுத்துருக்கள் (Fonts) <strong>வினோத் ராஜன் (Vinodh Rajan)</strong> என்பவரால் உருவாக்கப்பட்ட <strong><a href="https://github.com/virtualvinodh/jinavani" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Jinavani (ஜினவாணி)</a></strong> திட்டத்திலிருந்து தழுவி எடுக்கப்பட்டவை.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <User size={24} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '4px' }} />
            <div>
              <strong>உருவாக்கம் (Original Author):</strong> Vinodh Rajan
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Code size={24} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '4px' }} />
            <div>
              <strong>உரிமம் (License):</strong> GNU Affero General Public License v3.0 (AGPL-3.0)
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Under the terms of the AGPL-3.0 license, this modified tool acknowledges and attributes its core transliteration logic, font files, and educational structures to the original Jinavani project.
        </div>
      </div>
    </div>
  );
}
