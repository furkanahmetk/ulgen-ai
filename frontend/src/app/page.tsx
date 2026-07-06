'use client';

import { useState, useEffect } from 'react';
// @ts-ignore
import { DeployUtil, CLPublicKey } from 'casper-js-sdk';

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
  const [activeAccount, setActiveAccount] = useState<{ address: string, provider: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [feeEstimate, setFeeEstimate] = useState<{ amount: number, message: string } | null>(null);

  useEffect(() => {
    const syncAccount = () => {
      if (!window.csprclick) return;
      const account = window.csprclick.getActiveAccount();
      if (account?.public_key) {
        // Session timeout logic (30 minutes = 1800000 ms)
        const SESSION_TIMEOUT = 1800000;
        const lastActive = localStorage.getItem('cspr_last_active');
        const now = Date.now();
        
        if (lastActive && (now - parseInt(lastActive, 10) > SESSION_TIMEOUT)) {
          // Session expired
          window.csprclick.signOut();
          setActiveAccount(null);
          localStorage.removeItem('cspr_last_active');
          return;
        }
        
        // Update session
        localStorage.setItem('cspr_last_active', now.toString());
        setActiveAccount({
          address: account.public_key,
          provider: account.provider || 'connected wallet'
        });
      } else {
        setActiveAccount(null);
        localStorage.removeItem('cspr_last_active');
      }
    };

    // Initial checks and interval for session tracking
    setTimeout(syncAccount, 500);
    setTimeout(syncAccount, 1500);
    const interval = setInterval(syncAccount, 60000); // check session every minute

    window.addEventListener('csprclick:signed_in', syncAccount);
    window.addEventListener('csprclick:switched_account', syncAccount);
    window.addEventListener('csprclick:signed_out', syncAccount);
    window.addEventListener('csprclick:disconnected', syncAccount);
    window.addEventListener('csprclick:loaded', syncAccount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('csprclick:signed_in', syncAccount);
      window.removeEventListener('csprclick:switched_account', syncAccount);
      window.removeEventListener('csprclick:signed_out', syncAccount);
      window.removeEventListener('csprclick:disconnected', syncAccount);
      window.removeEventListener('csprclick:loaded', syncAccount);
    };
  }, []);

  const connectWallet = async () => {
    if (window.csprclick) {
      try {
        await window.csprclick.signIn();
        // Give it a small delay for the SDK state to update, then sync manually
        setTimeout(() => {
          if (window.csprclick) {
            const account = window.csprclick.getActiveAccount();
            if (account?.public_key) {
              localStorage.setItem('cspr_last_active', Date.now().toString());
              setActiveAccount({
                address: account.public_key,
                provider: account.provider || 'connected wallet'
              });
            }
          }
        }, 500);
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      alert('Casper Wallet SDK is loading, please try again in a moment.');
    }
  };

  const disconnectWallet = () => {
    if (window.csprclick) {
      window.csprclick.signOut();
    }
    setActiveAccount(null);
    localStorage.removeItem('cspr_last_active');
  };

  const estimateFee = async () => {
    if (!activeAccount) {
      alert("Please connect your Casper Wallet first!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/estimate-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFeeEstimate({ amount: data.estimatedFee, message: data.message });
    } catch (err: any) {
      alert(`Fee estimation failed: ${err.message}`);
    }
    setLoading(false);
  };

  const startInvestigation = async () => {
    if (!activeAccount) {
      alert("Please connect your Casper Wallet first!");
      return;
    }
    if (!feeEstimate) return;

    setLoading(true);
    setLogs([]);
    setResult(null);

    try {
      // 1. Construct the native Casper transfer for the Due Diligence fee
      logs.push(`💸 User: Requesting signature for ${feeEstimate.amount} CSPR Due Diligence fee...`);
      
      // The deployer wallet address where fees go
      const DESTINATION_WALLET = '0163d8A06Bab82776ec0fA0b38F1306e4E6a944468609AdF5c0F8F5Ad592Ef5d63'; 
      
      const deployParams = new DeployUtil.DeployParams(
        CLPublicKey.fromHex(activeAccount.address),
        'casper-test',
        1,
        1800000 // 30 minutes TTL
      );

      // feeEstimate.amount CSPR = feeEstimate.amount * 10^9 motes
      const amount = feeEstimate.amount * 1_000_000_000;
      const transferDeployItem = DeployUtil.ExecutableDeployItem.newTransfer(
        amount,
        CLPublicKey.fromHex(DESTINATION_WALLET),
        null,
        1 // id
      );

      // Standard payment for native transfer gas is 0.1 CSPR
      const payment = DeployUtil.standardPayment(100_000_000); 
      const deploy = DeployUtil.makeDeploy(deployParams, transferDeployItem, payment);
      const deployJson = DeployUtil.deployToJson(deploy);

      // 2. Request user signature via CSPR.click
      const sendResult = await window.csprclick.send(deployJson, activeAccount.address);
      
      if (!sendResult || !sendResult.deployHash) {
        throw new Error("Transaction was cancelled or failed to send.");
      }
      
      const deployHash = sendResult.deployHash;
      setLogs((prev: string[]) => [...prev, `✅ User: Fee transaction sent! DeployHash: ${deployHash}`]);
      setLogs((prev: string[]) => [...prev, `⏳ Agent: Verifying on-chain fee payment before proceeding...`]);

      // 3. Trigger backend with the deployHash
      const res = await fetch('http://localhost:3001/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type, deployHash, userAddress: activeAccount.address, estimatedFee: feeEstimate.amount }),
      });
      
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Simulate streaming logs with delays
      for (let i = 0; i < data.logs.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setLogs((prev: string[]) => [...prev, data.logs[i]]);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setResult(data.result);
    } catch (err: any) {
      setLogs((prev: string[]) => [...prev, `❌ ERROR: ${err.message}`]);
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
              <div 
                style={{
                  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--success)',
                  fontFamily: "'Fira Code', monospace", display: 'flex', flexDirection: 'column', gap: '2px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => {
                  navigator.clipboard.writeText(activeAccount.address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                title="Click to copy address"
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8, color: 'var(--text-muted)' }}>
                    {activeAccount.provider.replace('-', ' ')}
                  </span>
                  {copied && <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: 'bold' }}>Copied!</span>}
                </div>
                <span>🔗 {activeAccount.address.substring(0, 8)}...{activeAccount.address.substring(activeAccount.address.length - 6)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button className="btn-connect" onClick={connectWallet} style={{ fontSize: '10px', padding: '4px 8px', minHeight: 'unset', height: '22px' }}>
                  Change
                </button>
                <button className="btn-connect" onClick={disconnectWallet} style={{ fontSize: '10px', padding: '4px 8px', minHeight: 'unset', height: '22px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                  Disconnect
                </button>
              </div>
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setUrl(e.target.value); setFeeEstimate(null); }}
            />
            <select
              className="select-field"
              value={type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setType(e.target.value); setFeeEstimate(null); }}
            >
              <option value="DeFi">DeFi Protocol</option>
              <option value="RWA">Real World Asset</option>
            </select>
          </div>

          {feeEstimate && (
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)', color: 'var(--text-primary)', fontSize: '13px' }}>
              <div style={{ marginBottom: '8px', color: 'var(--accent)' }}>ℹ️ {feeEstimate.message}</div>
              {feeEstimate.breakdown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base LLM Analysis Cost:</span>
                    <span>{feeEstimate.breakdown.baseLlmCost} CSPR</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Premium Data Buffer (x402):</span>
                    <span>{feeEstimate.breakdown.potentialPremiumCost} CSPR</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Platform Margin (30%):</span>
                    <span>{feeEstimate.breakdown.margin.toFixed(2)} CSPR</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    <span>Total Maximum Budget:</span>
                    <span>{feeEstimate.amount} CSPR</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={!url || loading}
            onClick={feeEstimate ? startInvestigation : estimateFee}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="status-dot busy"></span>
                Processing...
              </span>
            ) : feeEstimate ? (
              `⚡ PAY ${feeEstimate.amount} CSPR & START`
            ) : (
              '⚡ ESTIMATE FEE'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '14px' }}>◈</span>
                  <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                    Investigation Report
                  </h2>
              </div>
              {result && (
                <button 
                  onClick={() => {
                    const mdContent = `
# Sentinel AI - Investigation Report
**Target:** ${url || 'Unknown'}
**Type:** ${type || 'Unknown'}

## 1. Risk Assessment
- **Score:** ${result.score}/100
- **Recommendation:** ${result.recommendation}

## 2. Analysis Summary
${result.reasoning}

## 3. Financial Summary
- **Collected Fee:** ${result.financials?.collected || '0'} CSPR
- **Agent Spent:** ${result.financials?.actualSpent || '0'} CSPR
- **Refunded:** ${result.financials?.refunded || '0'} CSPR
- **Platform Margin:** ${result.financials?.profitMargin?.toFixed(2) || '0'} CSPR

## 4. On-Chain Transparency (Hashes)
- **Initial Fee:** ${result.hashes?.initialPaymentHash || 'N/A'}
- **Premium Data (x402):** ${result.hashes?.premiumX402Hash || 'N/A'}
- **Refund:** ${result.hashes?.refundHash || 'N/A'}
- **Registry Log:** ${result.hashes?.registryHash || 'N/A'}

---
*Generated by Sentinel AI Autonomous Agent on Casper Network*
                    `.trim();
                    const blob = new Blob([mdContent], { type: 'text/markdown' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'sentinel-ai-report.md';
                    link.click();
                  }}
                  style={{ background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  📥 DOWNLOAD REPORT (.MD)
                </button>
              )}
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
              <div id="report-content" className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px', borderRadius: '8px', background: 'rgba(10, 14, 23, 0.9)' }}>
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
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      Financial Summary
                    </div>
                    {result.financials ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Collected Fee:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{result.financials.collected} CSPR</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Agent Spent:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{result.financials.actualSpent} CSPR</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px' }}>
                          <span>Refunded:</span>
                          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{result.financials.refunded} CSPR</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent)' }}>
                        {result.spent} CSPR
                      </div>
                    )}
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '14px',
                    borderLeft: '3px solid var(--success)',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      On-Chain Transparency
                    </div>
                    {result.hashes ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {result.hashes.initialPaymentHash && (
                          <div title={result.hashes.initialPaymentHash}>
                            <span style={{ color: 'var(--text-muted)' }}>FEE:</span> {result.hashes.initialPaymentHash.substring(0, 10)}...
                          </div>
                        )}
                        {result.hashes.premiumX402Hash && (
                          <div title={result.hashes.premiumX402Hash}>
                            <span style={{ color: 'var(--text-muted)' }}>X402:</span> {result.hashes.premiumX402Hash.substring(0, 10)}...
                          </div>
                        )}
                        {result.hashes.refundHash && (
                          <div title={result.hashes.refundHash}>
                            <span style={{ color: 'var(--success)' }}>REFUND:</span> {result.hashes.refundHash.substring(0, 10)}...
                          </div>
                        )}
                        {result.hashes.registryHash && (
                          <div title={result.hashes.registryHash}>
                            <span style={{ color: 'var(--text-muted)' }}>LOG:</span> {result.hashes.registryHash.substring(0, 10)}...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
                        ✓ Logged to Registry
                      </div>
                    )}
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
