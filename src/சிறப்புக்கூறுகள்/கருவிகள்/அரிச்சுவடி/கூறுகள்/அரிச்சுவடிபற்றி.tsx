import React from 'react';
import { Info, Code, User, Copyright, ArrowSquareOut, Heart } from '@phosphor-icons/react';

export function ArichuvadiAbout() {
  return (
    <div className="arichuvadi-about-page animate-entry">
      {/* Intro Section - Sits directly on the page */}
      <div className="arichuvadi-about-hero">
        <div className="arichuvadi-about-icon-badge">
          <Info size={28} weight="duotone" />
        </div>
        <h2 className="arichuvadi-about-title">
          நவில் அரிச்சுவடி பற்றி
        </h2>
        <p className="arichuvadi-about-subtitle">
          பண்டைய தமிழ் எழுத்து வடிவமாற்றி மற்றும் பயிலும் தளம்
        </p>
      </div>

      <div className="arichuvadi-about-prose">
        <p>
          <strong>நவில் அரிச்சுவடி (Navil Arichuvadi)</strong> என்பது பண்டைய தமிழ் எழுத்துக்களான <strong>தமிழி (Thamizhi / Tamil-Brahmi)</strong> மற்றும் <strong>வட்டெழுத்து (Vatteluttu)</strong> ஆகியவற்றைப் பயிலவும், பயன்படுத்தவும் உருவாக்கப்பட்ட ஒரு முழுமையான மென்பொருள் கருவியாகும்.
        </p>
        <p>
          இது நவீன தமிழ் உரைகளை பண்டைய எழுத்துக்களாக மாற்றுவது மட்டுமல்லாமல், அவற்றை எளிதாகப் படிப்பதற்கான பயிற்சி விளையாட்டுகள், நூல்கள் மற்றும் பிற கருவிகளையும் உள்ளடக்கியது.
        </p>
      </div>

      {/* Hybrid Attribution & License Section */}
      <div className="arichuvadi-about-hybrid-card">
        <div className="arichuvadi-hybrid-header">
          <div className="arichuvadi-hybrid-icon">
            <Copyright size={20} weight="fill" />
          </div>
          <div>
            <h3 className="arichuvadi-hybrid-title">உரிமம் மற்றும் கடப்பாடு</h3>
            <span className="arichuvadi-hybrid-subtitle">Attribution & Open Source License</span>
          </div>
        </div>

        <p className="arichuvadi-hybrid-desc">
          இந்த மென்பொருளின் அடிப்படை மாற்று இயந்திரம் (Core Transliteration Engine) மற்றும் எழுத்துருக்கள் (Fonts) <strong>வினோத் ராஜன் (Vinodh Rajan)</strong> என்பவரால் உருவாக்கப்பட்ட <strong>Jinavani (ஜினவாணி)</strong> திட்டத்திலிருந்து தழுவி எடுக்கப்பட்டவை.
        </p>

        {/* Hybrid Detail Badges */}
        <div className="arichuvadi-hybrid-badges-grid">
          <div className="arichuvadi-hybrid-badge-item">
            <User size={20} weight="duotone" className="hybrid-badge-icon" />
            <div className="hybrid-badge-text">
              <span className="hybrid-badge-label">உருவாக்கம் (Author)</span>
              <span className="hybrid-badge-val">Vinodh Rajan</span>
            </div>
          </div>

          <div className="arichuvadi-hybrid-badge-item">
            <Code size={20} weight="duotone" className="hybrid-badge-icon" />
            <div className="hybrid-badge-text">
              <span className="hybrid-badge-label">உரிமம் (License)</span>
              <span className="hybrid-badge-val">GNU AGPL v3.0</span>
            </div>
          </div>
        </div>

        <div className="arichuvadi-hybrid-actions">
          <a
            href="https://github.com/virtualvinodh/jinavani"
            target="_blank"
            rel="noopener noreferrer"
            className="arichuvadi-pill-btn active"
            style={{ textDecoration: 'none' }}
          >
            <span>Jinavani GitHub Repository</span>
            <ArrowSquareOut size={16} weight="bold" />
          </a>
        </div>

        <div className="arichuvadi-hybrid-legal-note">
          Under the terms of the AGPL-3.0 license, this modified tool acknowledges and attributes its core transliteration logic, font files, and educational structures to the original Jinavani project.
        </div>
      </div>
    </div>
  );
}

