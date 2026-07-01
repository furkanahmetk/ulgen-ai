'use client';

import { useState, useEffect } from 'react';

interface InvestigationResult {
  score: number;
  recommendation: string;
  spent: number;
  details: Record<string, unknown>;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DeFi');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);

  useEffect(() => {
    const handleConnected = (evt: Event) => {
      const detail = (evt as CustomEvent).detail;
      const account = detail?.activeKey || detail?.publicKey;
      if (account) setActiveAccount(account);
    };

    const handleDisconnected = () => setActiveAccount(null);

    window.addEventListener('csprclick:signed_in', handleConnected);
    window.addEventListener('csprclick:switched_account', handleConnected);
    window.addEventListener('csprclick:signed_out', handleDisconnected);
    window.addEventListener('csprclick:disconnected', handleDisconnected);

    return () => {
      window.removeEventListener('csprclick:signed_in', handleConnected);
      window.removeEventListener('csprclick:switched_account', handleConnected);
      window.removeEventListener('csprclick:signed_out', handleDisconnected);
      window.removeEventListener('csprclick:disconnected', handleDisconnected);
    };
  }, []);

  const connectWallet = () => {
    // @ts-expect-error - cspr.click global SDK loaded at runtime
    if (window.CsprClick) {
      // @ts-expect-error - cspr.click global SDK
      window.CsprClick.signIn();
    } else {
      alert('Casper Wallet SDK is loading, please try again in a moment.');
    }
  };

  const disconnectWallet = () => {
    // @ts-expect-error - cspr.click global SDK
    if (window.CsprClick) {
      // @ts-expect-error - cspr.click global SDK
      window.CsprClick.signOut();
    }
    setActiveAccount(null);
  };

  const startInvestigation = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      const data = await res.json();

      // Simulate streaming logs with delays
      for (let i = 0; i < data.logs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setLogs((prev: string[]) => [...prev, data.logs[i]]);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setResult(data.result);
    } catch {
      setLogs((prev: string[]) => [...prev, 'ERROR: Could not connect to Agent Backend.']);
    }

    setLoading(false);
  };

  const getLogClass = (log: string): string => {
    if (log.includes('[Thought]') || log.includes('Thought')) return 'thought';
    if (log.includes('[Action]') || log.includes('Purchasing') || log.includes('Paying')) return 'action';
    if (log.includes('[Observation]') || log.includes('Confidence')) return 'observation';
    return 'system';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getRecTag = (rec: string): string => {
    if (rec.includes('SAFE') || rec.includes('INVEST')) return 'tag-safe';
    if (rec.includes('CAUTION')) return 'tag-caution';
    return 'tag-danger';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(10, 14, 23, 0.95)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 900, color: 'var(--bg-primary)',
          }}>S</div>
          <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '2px' }}>
            SENTINEL<span style={{ color: 'var(--accent)' }}>_AI</span>
          </span>
          <span className="tag" style={{
            background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent)',
            border: '1px solid rgba(0, 240, 255, 0.2)', marginLeft: '8px',
          }}>v1.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span className={`status-dot ${activeAccount ? 'online' : 'busy'}`}></span>
            Casper Testnet
          </div>
          {activeAccount ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--success)',
                fontFamily: "'Fira Code', monospace",
              }}>
                🔗 {activeAccount.substring(0, 8)}...{activeAccount.substring(activeAccount.length - 6)}
              </div>
              <button className="btn-connect" onClick={disconnectWallet} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-connect" onClick={connectWallet}>
              🔐 Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '36px', fontWeight: 800, marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--text-primary), var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Autonomous Due Diligence Agent
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            Powered by Casper Network &bull; CSPR.cloud MCP &bull; x402 Facilitator &bull; Odra Framework
          </p>
        </div>

        {/* Input Panel */}
        <div className="glass-card accent-top" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 600 }}>▸</span>
            <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
              Target Specification
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px', marginBottom: '16px' }}>
            <input
              className="input-field"
              type="text"
              placeholder="https://defi-protocol.xyz or contract address..."
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            />
            <select
              className="select-field"
              value={type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
            >
              <option value="DeFi">DeFi Protocol</option>
              <option value="RWA">Real World Asset</option>
            </select>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={!url || loading}
            onClick={startInvestigation}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="status-dot busy"></span>
                Agent Analyzing...
              </span>
            ) : (
              '⚡ INITIATE DUE DILIGENCE'
            )}
          </button>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Live Agent Log */}
          <div className="glass-card" style={{ padding: '24px', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '14px' }}>⬡</span>
              <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                Live Agent Log
              </h2>
              {loading && <span className="status-dot busy" style={{ marginLeft: 'auto' }}></span>}
            </div>

            <div style={{
              flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px',
              background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px',
            }}>
              {logs.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Waiting for agent initialization...
                </div>
              ) : (
                logs.map((log: string, idx: number) => (
                  <div key={idx} className={`log-entry ${getLogClass(log)} animate-fade-in`}>
                    <span style={{ opacity: 0.4, marginRight: '8px', fontSize: '11px' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Investigation Report */}
          <div className="glass-card" style={{ padding: '24px', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '14px' }}>◈</span>
              <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                Investigation Report
              </h2>
            </div>

            {!result ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '13px', gap: '8px',
              }}>
                <span style={{ fontSize: '32px', opacity: 0.3 }}>◈</span>
                <span>Awaiting agent analysis...</span>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>Results will appear after investigation completes</span>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div className="score-ring animate-pulse-glow" style={{ color: getScoreColor(result.score) }}>
                    {result.score}
                  </div>
                  <div>
                    <span className={`tag ${getRecTag(result.recommendation)}`}>
                      {result.recommendation}
                    </span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
                      Risk assessment complete
                    </p>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px',
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      CSPR Spent
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
                      {result.spent} CSPR
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px',
                    borderLeft: '3px solid var(--success)',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      On-Chain Record
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
                      ✓ Logged to Registry
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div style={{
                  background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '14px',
                  fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6,
                  borderLeft: '3px solid var(--warning)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                    Analysis Summary
                  </div>
                  {String(result.details?.reason || 'No details available.')}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '16px 32px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '11px', color: 'var(--text-muted)',
      }}>
        <span>Built with Casper Builder Toolkit &bull; Odra Framework SKILL &bull; CSPR.cloud MCP</span>
        <span>Casper Agentic Buildathon 2026</span>
      </footer>
    </div>
  );
}
