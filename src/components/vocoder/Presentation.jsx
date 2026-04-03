import React, { useState, useEffect, useRef, useMemo } from 'react';
import './presentation.css';

export default function Presentation({ externalSlide }) {
  const currentSlide = externalSlide != null ? externalSlide : 0;
  const containerRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);
  const [cursorMode, setCursorMode] = useState('idle'); // 'idle', 'hovering', 'clicking'
  const [trail, setTrail] = useState([]);



  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const newParticle = { x: e.clientX, y: e.clientY, id: Math.random() };
      setTrail(prev => [...prev.slice(-15), newParticle]);
      setTimeout(() => {
        setTrail(prev => prev.filter(p => p.id !== newParticle.id));
      }, 500);

      const target = e.target;
      if (target.tagName === 'BUTTON' || target.classList.contains('nav-dot') || target.closest('section.slide')) {
        if (target.tagName === 'BUTTON' || target.classList.contains('nav-dot') || target.closest('.chip') || target.closest('.card')) {
          setCursorMode('hovering');
        } else {
          setCursorMode('idle');
        }
      } else {
        setCursorMode('idle');
      }
    };

    const handleMouseDown = () => setCursorMode('clicking');
    const handleMouseUp = () => setCursorMode('idle');

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="presentation-container" ref={containerRef}>
      {/* Custom Premium Cursor */}
      <div
        className={`custom-cursor ${cursorMode}`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: `translate(-50%, -50%)`,
          transition: cursorMode === 'clicking' ? 'none' : 'width 0.3s, height 0.3s, border-color 0.3s, background 0.3s'
        }}
      >
        <div style={{ width: '2px', height: '2px', background: 'var(--accent5)', borderRadius: '50%', opacity: 0.5 }}></div>
      </div>

      <div
        className="custom-cursor-dot"
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px`, transform: 'translate(-50%, -50%)', opacity: cursorMode === 'hovering' ? 0.3 : 1 }}
      />

      {/* Trail Effects */}
      {trail.map(p => (
        <div
          key={p.id}
          className="cursor-trail-particle"
          style={{ left: `${p.x}px`, top: `${p.y}px`, transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {/* Click Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="ripple"
          style={{ left: `${ripple.x}px`, top: `${ripple.y}px`, transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {/* Immersive Particle Background */}
      <div className="bg-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              width: `${(i % 5) + 2}px`,
              height: `${(i % 5) + 2}px`,
              animationDelay: `${i * 0.5}s`,
              transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)`
            }}
          />
        ))}
      </div>

      <div
        className="slides-wrapper"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          display: 'flex',
          transition: 'transform 0.8s cubic-bezier(0.2, 0, 0, 1)'
        }}
      >


        <section className={`slide ${currentSlide === 0 ? 'active-slide' : ''}`} id="s1" style={{ overflow: 'hidden' }}>
          {/* Liquid Atmosphere */}
          <div className="liquid-bg">
            <div className="liquid-blob" style={{ width: '60vw', height: '60vw', background: 'var(--accent5)', top: '-20%', left: '-10%', opacity: 0.15 }}></div>
            <div className="liquid-blob" style={{ width: '50vw', height: '50vw', background: 'var(--accent1)', bottom: '-10%', right: '-5%', opacity: 0.1 }}></div>
          </div>

          {/* Technical Blueprint Elements */}
          <div className="tech-badge" style={{ top: '100px', left: '60px' }}>
            பேராசிரியர் திரு. ஜெகன் பாபு ஐயா
          </div>
          <div className="tech-badge" style={{ bottom: '100px', left: '60px' }}>
            Faculty incharge : Mr. J. Jagan Babu Sir
          </div>
          <div className="tech-badge" style={{ top: '40px', right: '40px', textAlign: 'right' }}>
            CREATED BY ELVAN PARTHASARATHY
            <div style={{ fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--accent4)', marginTop: '4px', opacity: 0.8, fontFamily: "'Mukta Malar', sans-serif" }}>
              உருவாக்கியவர்: எல்வன் பார்த்தசாரதி
            </div>
          </div>

          <div className="slide-inner" style={{ textAlign: 'center', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="chip chip-blue" style={{ marginBottom: '30px', letterSpacing: '2px', background: 'rgba(77,150,255,0.1)' }}>
              Digital Signal Processing
            </div>

            <h1 className="manifesto-title">VOCODER</h1>

            <div style={{
              fontSize: 'clamp(0.9rem, 2.5vw, 1.4rem)',
              fontWeight: '300',
              letterSpacing: '1.5vw',
              color: 'var(--accent4)',
              textTransform: 'uppercase',
              marginTop: '10px',
              marginBottom: '50px',
              opacity: 0.9,
            }}>
              Voice Encoder
            </div>

            {/* Enhanced Frequency Visualizer */}
            <div style={{ width: '60%', height: '40px', margin: '0 auto 60px', opacity: 1.0 }}>
              <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
                {Array.from({ length: 60 }).map((_, i) => {
                  const jump = Math.sin(i * 0.2) * 20 + 30;
                  return (
                    <rect
                      key={i}
                      x={i * 17}
                      y={50 - jump / 2}
                      width="4"
                      height={jump}
                      fill={i % 2 === 0 ? 'var(--accent5)' : 'var(--accent4)'}
                      rx="2"
                    >
                      <animate attributeName="height" values={`${jump};${jump * 1.5};${jump}`} dur={`${0.8 + Math.random()}s`} repeatCount="indefinite" />
                      <animate attributeName="y" values={`${50 - jump / 2};${50 - (jump * 1.5) / 2};${50 - jump / 2}`} dur={`${0.8 + Math.random()}s`} repeatCount="indefinite" />
                    </rect>
                  );
                })}
              </svg>
            </div>

            <div className="presenter-line" style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 40px',
              borderRadius: '20px',
              display: 'inline-block',
              marginTop: '0',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.65rem', letterSpacing: '4px', opacity: 0.5, marginBottom: '8px', textTransform: 'uppercase' }}>Presented by</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '3px', textTransform: 'uppercase', color: '#fff' }}>
                Jaiprakash Parthasarathy
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '500', letterSpacing: '1px', color: 'var(--accent4)', marginTop: '4px', opacity: 0.9, fontFamily: "'Mukta Malar', sans-serif" }}>
                ஜெய்பிரகாஷ் பார்த்தசாரதி
              </div>
            </div>
          </div>

          <div className="slide-num">01 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 1 ? 'active-slide' : ''}`} id="s2">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent4)', top: '50%', left: '-150px', transform: 'translateY(-50%)' }}></div>
          <div className="slide-inner">
            <div className="chip chip-blue">INTRO</div>
            <h2>Why Do We Need This?</h2>
            <div className="highlight-box hb-blue">
              <span style={{ fontSize: '2rem' }}>📡</span>
              Imagine sending voice with <strong>way less data</strong> — without losing the message!
            </div>
            <ul className="bullet-list">
              <li><div className="dot dot-red"></div>Normal voice signal carries a <strong>huge amount of data</strong></li>
              <li><div className="dot dot-yellow"></div>Not always practical to send everything over a <strong>limited channel</strong></li>
              <li><div className="dot dot-green"></div>So instead of the full signal → we send only the <strong>important features</strong></li>
            </ul>
            <div className="highlight-box hb-purple" style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '1.5rem' }}>👉</span>
              <span>This smart trick is done using a <strong>VOCODER</strong></span>
            </div>
          </div>
          <div className="slide-num">02 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 2 ? 'active-slide' : ''}`} id="s3">
          <div className="bg-circle" style={{ width: '450px', height: '450px', background: 'var(--accent4)', bottom: '-150px', right: '-100px', opacity: '0.15' }}></div>
          <div className="slide-inner">
            <div className="chip chip-purple">DEFINITION</div>
            <h2>What is a Vocoder?</h2>
            <div className="def-card">
              A <strong style={{ color: 'var(--accent4)' }}>VOCODER</strong> (Voice Encoder) is a system that
              <strong style={{ color: 'var(--accent2)' }}> analyzes speech</strong>,
              <strong style={{ color: 'var(--accent1)' }}> extracts important features</strong>,
              <strong style={{ color: 'var(--accent5)' }}> transmits them</strong>, and
              <strong style={{ color: 'var(--accent3)' }}> reconstructs the speech</strong> at the other end.
            </div>
            <div className="def-chain">
              <div className="dc-step fb1">🎙️ Analyze</div>
              <span className="dc-arrow">→</span>
              <div className="dc-step fb2">🔍 Extract</div>
              <span className="dc-arrow">→</span>
              <div className="dc-step fb3">📡 Transmit</div>
              <span className="dc-arrow">→</span>
              <div className="dc-step fb5">🔊 Reconstruct</div>
            </div>
          </div>
          <div className="slide-num">03 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 3 ? 'active-slide' : ''}`} id="s4">
          <div className="bg-circle" style={{ width: '350px', height: '350px', background: 'var(--accent1)', top: '-100px', right: '-80px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-red">WHY?</div>
            <h2>The Problem & Solution</h2>
            <div className="cards cards-2" style={{ marginTop: '20px' }}>
              <div className="card card-red">
                <div className="icon">❌</div>
                <h3>The Problem</h3>
                <ul className="bullet-list" style={{ marginTop: '10px' }}>
                  <li><div className="dot dot-red"></div>Speech signal = <strong>large data</strong></li>
                  <li><div className="dot dot-red"></div>Bandwidth is <strong>limited</strong></li>
                  <li><div className="dot dot-red"></div>Direct transmission is <strong>wasteful</strong></li>
                </ul>
              </div>
              <div className="card card-green">
                <div className="icon">✅</div>
                <h3>The Solution</h3>
                <ul className="bullet-list" style={{ marginTop: '10px' }}>
                  <li><div className="dot dot-green"></div>Send only <strong>important parameters</strong></li>
                  <li><div className="dot dot-green"></div><strong>Reduced bandwidth</strong> usage</li>
                  <li><div className="dot dot-green"></div><strong>Faster</strong> transmission</li>
                </ul>
              </div>
            </div>
            <div className="highlight-box hb-yellow" style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <span>Vocoder is the <strong>smart middle-man</strong> that makes this possible!</span>
            </div>
          </div>
          <div className="slide-num">04 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 4 ? 'active-slide' : ''}`} id="s5">
          <div className="bg-circle" style={{ width: '500px', height: '500px', background: 'var(--accent2)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: '0.07' }}></div>
          <div className="slide-inner">
            <div className="chip chip-yellow">CORE IDEA</div>
            <h2>What Exactly Gets Sent?</h2>
            <div className="highlight-box hb-red" style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '1.4rem' }}>🚫</span>
              <span>Vocoder does <strong>NOT</strong> send the full speech signal</span>
            </div>
            <p style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--muted)' }}>Instead, it sends only these 3 key parameters:</p>
            <div className="cards cards-3">
              <div className="card card-red" style={{ textAlign: 'center' }}>
                <div className="icon">🎵</div>
                <h3 style={{ color: 'var(--accent1)' }}>Pitch</h3>
                <p>How high or low the voice sounds</p>
              </div>
              <div className="card card-yellow" style={{ textAlign: 'center' }}>
                <div className="icon">⚡</div>
                <h3 style={{ color: 'var(--accent2)' }}>Energy</h3>
                <p>How loud or strong the voice is</p>
              </div>
              <div className="card card-blue" style={{ textAlign: 'center' }}>
                <div className="icon">📊</div>
                <h3 style={{ color: 'var(--accent4)' }}>Spectral Info</h3>
                <p>The shape / character of the sound</p>
              </div>
            </div>
          </div>
          <div className="slide-num">05 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 5 ? 'active-slide' : ''}`} id="s6">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent3)', bottom: '-100px', left: '-100px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-green">SPEECH MODEL</div>
            <h2>How Speech Actually Works</h2>
            <div className="highlight-box hb-green" style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '1.5rem' }}>🗣️</span>
              <span>Speech = <strong>Source</strong> + <strong>Filter</strong></span>
            </div>
            <div className="sf-row">
              <div className="sf-box sf-src">
                <div className="big-icon">🫀</div>
                <div className="label" style={{ color: 'var(--accent1)' }}>Source</div>
                <div className="desc">Vocal cords vibrate to create the <strong>excitation signal</strong> — the raw buzz!</div>
              </div>
              <div className="sf-eq">+</div>
              <div className="sf-box sf-flt">
                <div className="big-icon">👄</div>
                <div className="label" style={{ color: 'var(--accent4)' }}>Filter</div>
                <div className="desc">Mouth & throat <strong>shape the sound</strong> — giving it personality!</div>
              </div>
            </div>
            <div className="highlight-box hb-yellow" style={{ marginTop: '20px' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <span><em>"Source creates the sound, Filter shapes it into words"</em></span>
            </div>
          </div>
          <div className="slide-num">06 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 6 ? 'active-slide' : ''}`} id="s7">
          <div className="bg-circle" style={{ width: '350px', height: '350px', background: 'var(--accent5)', top: '-80px', right: '-80px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-purple">COMPONENTS</div>
            <h2>Two Main Parts</h2>
            <div className="comp-grid">
              <div className="comp-card cc-red">
                <div className="num">1</div>
                <div className="title">Excitation Signal <span style={{ fontSize: '1.2rem' }}>🔥</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '6px' }}>The SOURCE</div>
                <div className="items">
                  <div className="item"><span style={{ color: 'var(--accent1)' }}>●</span> <strong>Pitch</strong> — fundamental frequency</div>
                  <div className="item"><span style={{ color: 'var(--accent1)' }}>●</span> <strong>Voiced</strong> — vocal cord vibration (e.g. "aaa")</div>
                  <div className="item"><span style={{ color: 'var(--accent1)' }}>●</span> <strong>Unvoiced</strong> — noise burst (e.g. "sss", "fff")</div>
                </div>
              </div>
              <div className="comp-card cc-blue">
                <div className="num">2</div>
                <div className="title">Spectral Envelope <span style={{ fontSize: '1.2rem' }}>📈</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '6px' }}>The FILTER</div>
                <div className="items">
                  <div className="item"><span style={{ color: 'var(--accent4)' }}>●</span> <strong>Shape of the sound</strong></div>
                  <div className="item"><span style={{ color: 'var(--accent4)' }}>●</span> Captures <strong>vocal tract resonance</strong></div>
                  <div className="item"><span style={{ color: 'var(--accent4)' }}>●</span> Defines the <strong>timbre & quality</strong></div>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-num">07 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 7 ? 'active-slide' : ''}`} id="s8">
          <div className="bg-circle" style={{ width: '500px', height: '500px', background: 'var(--accent4)', top: '-100px', right: '-150px', opacity: 0.1 }}></div>
          <div className="slide-inner" style={{ textAlign: 'center' }}>
            <div className="chip chip-purple">PHASE 2</div>
            <h1 style={{ fontSize: '3.5rem', marginTop: '20px', color: 'var(--text)' }}>Mathematical<br />Model</h1>
            <p style={{ color: 'var(--muted)', marginTop: '20px', fontSize: '1.2rem' }}>Understanding the equations in a simple way</p>
            <div className="divider" style={{ margin: '40px auto', maxWidth: '200px', borderTop: '2px solid var(--accent4)' }}></div>
          </div>
          <div className="slide-num">08 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 8 ? 'active-slide' : ''}`} id="s9">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent1)', bottom: '-100px', left: '-150px', opacity: 0.12 }}></div>
          <div className="slide-inner">
            <div className="chip chip-blue">BASIC IDEA</div>
            <h2>The System Model</h2>
            <div className="highlight-box hb-blue">
              <span style={{ fontSize: '1.5rem' }}>⚙️</span>
              <span>Speech can be modeled as a mathematical system where an <strong>input</strong> is transformed by a <strong>system</strong>.</span>
            </div>
            <div className="def-card" style={{ textAlign: 'center', fontSize: '2.5rem', padding: '40px', margin: '30px 0', background: 'rgba(79,195,247,0.05)', border: '1px dashed var(--accent1)' }}>
              <strong style={{ color: 'var(--accent1)', letterSpacing: '2px' }}>y(n) = x(n) * h(n)</strong>
            </div>
            <ul className="bullet-list" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-around', listStyle: 'none' }}>
              <li><div className="dot dot-blue"></div><strong>x(n)</strong>: Input</li>
              <li><div className="dot dot-purple"></div><strong>h(n)</strong>: System</li>
              <li><div className="dot dot-green"></div><strong>y(n)</strong>: Output</li>
            </ul>
            <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '20px', fontStyle: 'italic' }}>"Output = Input &otimes; System characteristics"</p>
          </div>
          <div className="slide-num">09 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 9 ? 'active-slide' : ''}`} id="s10">
          <div className="bg-circle" style={{ width: '450px', height: '450px', background: 'var(--accent2)', top: '50%', right: '-150px', transform: 'translateY(-50%)', opacity: 0.1 }}></div>
          <div className="slide-inner">
            <div className="chip chip-yellow">VOCORDER CORE</div>
            <h2>The Vocoder Equation</h2>
            <div className="highlight-box hb-yellow" style={{ marginBottom: '30px' }}>
              <span style={{ fontSize: '1.5rem' }}>💎</span>
              <span>In a vocoder, the "Source" is specifically the <strong>Excitation Signal</strong>.</span>
            </div>
            <div className="def-card" style={{ textAlign: 'center', fontSize: '2.8rem', padding: '45px', margin: '20px 0', boxShadow: 'var(--shadow-premium)' }}>
              <strong style={{ color: 'var(--accent2)' }}>y(n) = e(n) * h(n)</strong>
            </div>
            <div className="cards cards-3" style={{ marginTop: '40px' }}>
              <div className="card card-yellow">
                <strong>e(n)</strong><br /><span style={{ fontSize: '0.85rem' }}>Excitation (Source)</span>
              </div>
              <div className="card card-blue">
                <strong>h(n)</strong><br /><span style={{ fontSize: '0.85rem' }}>Vocal Tract (Filter)</span>
              </div>
              <div className="card card-green">
                <strong>y(n)</strong><br /><span style={{ fontSize: '0.85rem' }}>Output Speech</span>
              </div>
            </div>
          </div>
          <div className="slide-num">10 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 10 ? 'active-slide' : ''}`} id="s11">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent3)', top: '-100px', left: '-100px', opacity: 0.12 }}></div>
          <div className="slide-inner">
            <div className="chip chip-green">SOURCE TYPES</div>
            <h2>Two Types of Excitation e(n)</h2>
            <div className="pc-grid" style={{ marginTop: '30px' }}>
              <div className="pc-box pc-good" style={{ borderColor: 'var(--accent2)' }}>
                <h3 style={{ color: 'var(--accent2)' }}>1. Voiced Sound</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Created by regular vocal cord vibration.</p>
                <div style={{ background: 'rgba(255,213,79,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid var(--accent2)' }}>
                  <strong>Periodic Signal</strong><br />
                  <span style={{ fontSize: '0.85rem' }}>Example: aaa, ooo, eee</span>
                </div>
              </div>
              <div className="pc-box pc-bad" style={{ borderColor: 'var(--accent1)' }}>
                <h3 style={{ color: 'var(--accent1)' }}>2. Unvoiced Sound</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Created by air turbulence (no vibration).</p>
                <div style={{ background: 'rgba(79,195,247,0.1)', padding: '10px', borderRadius: '8px', border: '1px solid var(--accent1)' }}>
                  <strong>Noise Signal</strong><br />
                  <span style={{ fontSize: '0.85rem' }}>Example: sss, fff, hhh</span>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-num">11 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 11 ? 'active-slide' : ''}`} id="s12">
          <div className="bg-circle" style={{ width: '600px', height: '600px', background: 'var(--accent5)', bottom: '-200px', right: '-200px', opacity: 0.08 }}></div>
          <div className="slide-inner">
            <div className="chip chip-purple">LPC ANALYSIS</div>
            <h2>Linear Predictive Coding (LPC)</h2>
            <div className="highlight-box hb-purple" style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '1.5rem' }}>📈</span>
              <span>This is the magic equation that lets us predict speech!</span>
            </div>
            <div className="def-card" style={{ textAlign: 'center', fontSize: '2.2rem', padding: '40px', background: '#111', border: '1px solid var(--accent5)' }}>
              <strong style={{ color: 'var(--accent5)' }}>x(n) = Σ a<sub>k</sub> x(n-k) + e(n)</strong>
            </div>
            <div className="cards cards-2" style={{ marginTop: '30px' }}>
              <div className="card card-blue">
                <h3>Σ a<sub>k</sub> x(n-k)</h3>
                <p>Weighted sum of <strong>past speech samples</strong></p>
              </div>
              <div className="card card-red">
                <h3>e(n)</h3>
                <p>The <strong>current excitation</strong> (prediction error)</p>
              </div>
            </div>
          </div>
          <div className="slide-num">12 / 22</div>
        </section>

        <section className={`slide ${currentSlide === 12 ? 'active-slide' : ''}`} id="s13">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent2)', top: '10%', right: '10%', opacity: 0.05 }}></div>
          <div className="slide-inner">
            <div className="chip chip-yellow">LPC SIMPLIFIED</div>
            <h2>The Simple Meaning</h2>
            <div className="def-card" style={{ fontSize: '1.8rem', textAlign: 'center', margin: '40px 0', borderLeft: '10px solid var(--accent2)' }}>
              Speech = <span style={{ color: 'var(--accent4)' }}>PAST</span> + <span style={{ color: 'var(--accent1)' }}>SOURCE</span>
            </div>
            <div className="app-grid" style={{ marginTop: '40px' }}>
              <div className="app-card">
                <div className="app-icon" style={{ color: 'var(--accent4)' }}>⏳</div>
                <div className="app-text">
                  <h3>Previous Values</h3>
                  <p>The past samples tell us the <strong>shape</strong> of the vocal tract filter.</p>
                </div>
              </div>
              <div className="app-card">
                <div className="app-icon" style={{ color: 'var(--accent1)' }}>⚡</div>
                <div className="app-text">
                  <h3>Excitation</h3>
                  <p>The source adds the <strong>energy</strong> needed to make the sound audible.</p>
                </div>
              </div>
            </div>
            <div className="highlight-box hb-green" style={{ marginTop: '30px', textAlign: 'center' }}>
              <strong>"We predict the current sample based on what was said just before it!"</strong>
            </div>
          </div>
          <div className="slide-num">13 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 13 ? 'active-slide' : ''}`} id="s14">
          <div className="bg-circle" style={{ width: '600px', height: '300px', background: 'var(--accent4)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: '0.06', filter: 'blur(100px)' }}></div>
          <div className="slide-inner">
            <div className="chip chip-blue">BLOCK DIAGRAM</div>
            <h2>The Full Picture</h2>
            <div className="flow" style={{ marginTop: '28px' }}>
              <div className="flow-box fb1">🎙️<br />Input Speech</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box fb2">🔬<br />Analysis</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box fb3">📦<br />Parameters</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box fb4">📡<br />Transmission</div>
              <div className="flow-arrow">→</div>
              <div className="flow-box fb5">🔊<br />Output Speech</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <div style={{ background: 'rgba(107,203,119,0.1)', border: '1px dashed var(--accent3)', borderRadius: '10px', padding: '10px 20px', fontSize: '0.85rem', color: 'var(--accent3)', fontFamily: "'Space Mono', monospace" }}>
                ↑ Synthesis happens here (decoder reconstructs speech)
              </div>
            </div>
            <div className="cards cards-2" style={{ marginTop: '24px' }}>
              <div className="highlight-box hb-yellow" style={{ margin: '0' }}>
                <span>🔵</span> <span><strong>Encoder side</strong>: Analysis + Parameters</span>
              </div>
              <div className="highlight-box hb-green" style={{ margin: '0' }}>
                <span>🟢</span> <span><strong>Decoder side</strong>: Synthesis + Output</span>
              </div>
            </div>
          </div>
          <div className="slide-num">14 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 14 ? 'active-slide' : ''}`} id="s15">
          <div className="bg-circle" style={{ width: '350px', height: '350px', background: 'var(--accent2)', top: '-50px', left: '-80px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-yellow">ENCODER</div>
            <h2>Analysis Side 🔬</h2>
            <div className="codec-box cb-enc" style={{ marginBottom: '0' }}>
              <div className="codec-icon">⚙️</div>
              <div className="codec-title" style={{ color: 'var(--accent2)' }}>What the Encoder Does</div>
              <div className="codec-list">
                <span>📥 Takes the raw <strong>input speech signal</strong></span>
                <span>🔍 Extracts <strong>Pitch</strong> — is the signal voiced or unvoiced?</span>
                <span>⚡ Extracts <strong>Energy</strong> — how loud is each segment?</span>
                <span>📊 Extracts <strong>Spectral Envelope</strong> — shape of the sound</span>
                <span>📦 Converts everything into <strong>compact parameters</strong></span>
              </div>
            </div>
            <div className="highlight-box hb-yellow" style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '1.5rem' }}>👉</span>
              <span>The encoder is like a <strong>reporter</strong> — it summarizes the speech, not records it!</span>
            </div>
          </div>
          <div className="slide-num">15 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 15 ? 'active-slide' : ''}`} id="s16">
          <div className="bg-circle" style={{ width: '350px', height: '350px', background: 'var(--accent3)', bottom: '-50px', right: '-80px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-green">DECODER</div>
            <h2>Synthesis Side 🔊</h2>
            <div className="codec-box cb-dec">
              <div className="codec-icon">🏗️</div>
              <div className="codec-title" style={{ color: 'var(--accent3)' }}>What the Decoder Does</div>
              <div className="codec-list">
                <span>📥 Receives the transmitted <strong>parameters</strong></span>
                <span>⚡ Generates the <strong>excitation signal</strong> (voiced/unvoiced)</span>
                <span>🎛️ Applies the <strong>spectral filter</strong> to shape the sound</span>
                <span>🔊 Produces the <strong>reconstructed speech</strong> output</span>
              </div>
            </div>
            <div className="highlight-box hb-green" style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '1.5rem' }}>👉</span>
              <span>The decoder is like a <strong>builder</strong> — it recreates speech from the summary!</span>
            </div>
          </div>
          <div className="slide-num">16 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 16 ? 'active-slide' : ''}`} id="s17">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent3)', top: '50%', left: '-150px', transform: 'translateY(-50%)', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-green">ADVANTAGES</div>
            <h2>Why It's Awesome ✅</h2>
            <ul className="bullet-list" style={{ marginTop: '16px' }}>
              <li><div className="dot dot-green"></div>
                <div><strong>Reduces Bandwidth</strong> — transmit voice using far less data than raw audio</div>
              </li>
              <li><div className="dot dot-green"></div>
                <div><strong>Efficient Transmission</strong> — works well even on low-bandwidth channels</div>
              </li>
              <li><div className="dot dot-green"></div>
                <div><strong>Enables Compression</strong> — great for storing & streaming speech</div>
              </li>
              <li><div className="dot dot-green"></div>
                <div><strong>Voice Effects</strong> — pitch shifting, robot voice, voice morphing 🤖</div>
              </li>
              <li><div className="dot dot-green"></div>
                <div><strong>Security</strong> — parameters can be encrypted for secure comms 🔐</div>
              </li>
            </ul>
          </div>
          <div className="slide-num">17 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 17 ? 'active-slide' : ''}`} id="s18">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent1)', top: '50%', right: '-150px', transform: 'translateY(-50%)', opacity: '0.1' }}></div>
          <div className="slide-inner">
            <div className="chip chip-red">LIMITATIONS</div>
            <h2>Tradeoffs ⚠️</h2>
            <div className="pc-grid">
              <div className="pc-box pc-good">
                <h3>✅ What We Gain</h3>
                <ul>
                  <li><span className="tick">✓</span> Much smaller data size</li>
                  <li><span className="tick">✓</span> Faster transmission</li>
                  <li><span className="tick">✓</span> Bandwidth efficiency</li>
                  <li><span className="tick">✓</span> Easy to encrypt</li>
                </ul>
              </div>
              <div className="pc-box pc-bad">
                <h3>⚠️ What We Lose</h3>
                <ul>
                  <li><span className="cross">✗</span> Speech quality not perfect</li>
                  <li><span className="cross">✗</span> Slightly robotic / artificial sound</li>
                  <li><span className="cross">✗</span> Nuances may be lost</li>
                  <li><span className="cross">✗</span> Processing adds slight delay</li>
                </ul>
              </div>
            </div>
            <div className="highlight-box hb-yellow" style={{ marginTop: '24px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚖️</span>
              <span>It's a <strong>tradeoff</strong>: quality vs. efficiency. Vocoder chooses efficiency!</span>
            </div>
          </div>
          <div className="slide-num">18 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 18 ? 'active-slide' : ''}`} id="s19">
          <div className="bg-circle" style={{ width: '500px', height: '500px', background: 'var(--accent5)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: '0.07' }}></div>
          <div className="slide-inner">
            <div className="chip chip-purple">APPLICATIONS</div>
            <h2>Where Is It Used? 🌍</h2>
            <div className="app-grid">
              <div className="app-card">
                <div className="app-icon">🤖</div>
                <div className="app-text">
                  <h3>Voice Assistants</h3>
                  <p>Siri, Alexa, Google — all use vocoder-like compression</p>
                </div>
              </div>
              <div className="app-card">
                <div className="app-icon">🔐</div>
                <div className="app-text">
                  <h3>Secure Communication</h3>
                  <p>Military & encrypted voice calls</p>
                </div>
              </div>
              <div className="app-card">
                <div className="app-icon">🎵</div>
                <div className="app-text">
                  <h3>Music (Robot Voice)</h3>
                  <p>Daft Punk, T-Pain, modern pop effects</p>
                </div>
              </div>
              <div className="app-card">
                <div className="app-icon">📞</div>
                <div className="app-text">
                  <h3>Speech Compression</h3>
                  <p>VoIP, GSM mobile calls, satellite phones</p>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-num">19 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 19 ? 'active-slide' : ''}`} id="s20">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent2)', bottom: '-100px', left: '-100px', opacity: '0.1' }}></div>
          <div className="slide-inner" style={{ textAlign: 'center' }}>
            <div className="chip chip-yellow">REMEMBER THIS!</div>
            <h2>Easy Memory Trick 🧠</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>Just remember: <strong style={{ color: 'var(--text)' }}>A → T → S</strong></p>
            <div className="memory-row">
              <div className="mem-block mb1">
                <div className="letter">A</div>
                <div className="word">Analysis</div>
                <div className="desc">Encoder extracts features from speech</div>
              </div>
              <div className="mem-arrow">→</div>
              <div className="mem-block mb2">
                <div className="letter">T</div>
                <div className="word">Transmission</div>
                <div className="desc">Parameters sent over the channel</div>
              </div>
              <div className="mem-arrow">→</div>
              <div className="mem-block mb3">
                <div className="letter">S</div>
                <div className="word">Synthesis</div>
                <div className="desc">Decoder rebuilds the speech</div>
              </div>
            </div>
            <div className="highlight-box hb-yellow" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <span style={{ fontSize: '1.5rem' }}>🎯</span>
              <span>Vocoder = <strong>Analyze</strong> it, <strong>Transmit</strong> it, <strong>Synthesize</strong> it!</span>
            </div>
          </div>
          <div className="slide-num">20 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 20 ? 'active-slide' : ''}`} id="s21">
          <div className="bg-circle" style={{ width: '400px', height: '400px', background: 'var(--accent4)', top: '-80px', right: '-100px', opacity: '0.12' }}></div>
          <div className="slide-inner">
            <div className="chip chip-blue">CONCLUSION</div>
            <h2>Key Takeaways 🏁</h2>
            <div className="concl-list">
              <div className="concl-item">
                <div className="concl-num">01</div>
                <div>Vocoder sends only <strong>features (pitch, energy, spectral info)</strong> — NOT the full speech signal</div>
              </div>
              <div className="concl-item">
                <div className="concl-num">02</div>
                <div>It <strong>saves bandwidth</strong> by transmitting compact parameters instead of raw audio</div>
              </div>
              <div className="concl-item">
                <div className="concl-num">03</div>
                <div>Encoder <strong>analyzes & extracts</strong> → Decoder <strong>synthesizes & reconstructs</strong></div>
              </div>
              <div className="concl-item">
                <div className="concl-num">04</div>
                <div>Critical technology in <strong>modern communication, music & AI voice systems</strong></div>
              </div>
            </div>
          </div>
          <div className="slide-num">21 / 22</div>
        </section>


        <section className={`slide ${currentSlide === 21 ? 'active-slide' : ''}`} id="s22">
          <div className="bg-circle" style={{ width: '600px', height: '600px', background: 'var(--accent5)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: '0.12' }}></div>
          <div className="float-icon" style={{ left: '5%', right: 'auto', top: '15%', fontSize: '5rem', opacity: '0.06' }}>🎵</div>
          <div className="float-icon" style={{ right: '5%', top: '60%', fontSize: '6rem', opacity: '0.06', animationDelay: '1s' }}>🔊</div>
          <div className="slide-inner" style={{ textAlign: 'center' }}>
            <div className="chip chip-purple" style={{ margin: '0 auto 20px' }}>That's a wrap!</div>
            <div className="ty-big" style={{
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              lineHeight: '1.4',
              fontFamily: "'Arima', 'Arial Unicode MS', sans-serif",
              background: 'none',
              WebkitBackgroundClip: 'initial',
              WebkitTextFillColor: 'var(--accent2)',
              color: 'var(--accent2)'
            }}>
              நன்றி<br />
              ధన్యవాదాలు 🙌
            </div>
            <div className="ty-sub">Digital Signal Processing — Unit 5 &nbsp;|&nbsp; VOCODER</div>
            <div className="divider" style={{ margin: '30px auto', maxWidth: '300px' }}></div>
            <div style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, rgba(157,80,187,0.2), rgba(110,36,141,0.2))',
              border: '1px solid var(--accent5)',
              color: 'var(--accent5)',
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '2px',
              marginBottom: '25px',
              boxShadow: '0 0 20px rgba(157,80,187,0.15)',
              fontFamily: "'Poppins', sans-serif",
              animation: 'pulseGlow 2s ease-in-out infinite',
              textAlign: 'center'
            }}>
              CREATED BY ELVAN PARTHASARATHY
              <div style={{ fontSize: '0.95rem', fontWeight: '400', letterSpacing: '1px', color: 'var(--accent4)', marginTop: '6px', opacity: 0.9, fontFamily: "'Mukta Malar', sans-serif" }}>
                உருவாக்கியவர்: எல்வன் பார்த்தசாரதி
              </div>
            </div>
            <div className="questions-badge">
              “Vocoder generates speech by passing excitation through a vocal tract filter.”
            </div>
            <p style={{ marginTop: '40px', fontSize: '0.85rem', color: 'var(--muted)', fontFamily: "'Space Mono', monospace" }}>
              Tap left/right or use arrows to navigate
            </p>
          </div>
          <div className="slide-num">22 / 22</div>
        </section>
      </div>


    </div>
  );
}
