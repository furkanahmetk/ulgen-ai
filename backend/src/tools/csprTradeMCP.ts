/**
 * CSPR.trade MCP Tool
 * Connects to the public CSPR.trade MCP server for DEX operations.
 */

const CSPR_TRADE_MCP_URL = process.env.CSPR_TRADE_MCP_URL || 'https://mcp.cspr.trade/mcp';

let mcpSessionId: string | null = null;

async function getMcpSessionId(): Promise<string> {
    if (mcpSessionId) return mcpSessionId;

    const initBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: { name: 'sentinel-ai-backend', version: '1.0.0' }
        }
    };

    const res = await fetch(CSPR_TRADE_MCP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(initBody),
    });

    if (!res.ok) {
        throw new Error(`CSPR.trade MCP init error ${res.status}: ${await res.text()}`);
    }

    const sessionId = res.headers.get('mcp-session-id');
    if (!sessionId) {
        throw new Error('CSPR.trade MCP did not return an mcp-session-id header');
    }

    mcpSessionId = sessionId;
    return sessionId;
}

/**
 * Call a tool on the CSPR.trade MCP Server via Streamable HTTP (custom session headers).
 */
export async function callTradeMCPTool(toolName: string, args: Record<string, any>): Promise<any> {
    const sessionId = await getMcpSessionId();

    const requestBody = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
            name: toolName,
            arguments: args,
        },
    };

    const res = await fetch(CSPR_TRADE_MCP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'mcp-session-id': sessionId
        },
        body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
        throw new Error(`CSPR.trade MCP error ${res.status}: ${await res.text()}`);
    }

    const responseText = await res.text();
    
    // Parse SSE (Server-Sent Events) lines
    const lines = responseText.split('\n');
    let parsedJson: any = null;

    for (const line of lines) {
        if (line.startsWith('data: ')) {
            try {
                parsedJson = JSON.parse(line.substring(6).trim());
                if (parsedJson && (parsedJson.result || parsedJson.error)) {
                    break; // Found the JSON-RPC response
                }
            } catch (e) {
                // Ignore partial or invalid JSON lines in the stream
            }
        }
    }

    // Fallback if not an SSE stream (pure JSON)
    if (!parsedJson) {
        try {
            parsedJson = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Failed to parse MCP response. Raw text: ${responseText}`);
        }
    }

    // Standard MCP tools/call returns {"result": {"content": [{text: "..."}]}}
    if (parsedJson?.result?.content?.[0]?.text) {
        try {
            return JSON.parse(parsedJson.result.content[0].text);
        } catch(e) {
            return parsedJson.result.content[0].text;
        }
    }

    return parsedJson;
}

/** Get all available tokens on CSPR.trade with optional fiat pricing */
export async function getTokens(currency = 'USD'): Promise<any> {
    return callTradeMCPTool('get_tokens', { currency });
}

/** Get a swap quote */
export async function getQuote(tokenIn: string, tokenOut: string, amount: string, type = 'exact_in'): Promise<any> {
    return callTradeMCPTool('get_quote', { token_in: tokenIn, token_out: tokenOut, amount, type });
}

/** Analyze a trade for safety (price impact, slippage, recommendation) */
export async function analyzeTrade(tokenIn: string, tokenOut: string, amount: string): Promise<any> {
    return callTradeMCPTool('analyze_trade', { token_in: tokenIn, token_out: tokenOut, amount });
}

/** Get trading pairs with reserves and stats */
export async function getPairs(): Promise<any> {
    return callTradeMCPTool('get_pairs', {});
}

/** Get OHLCV price history for a token */
export async function getTokenPriceHistory(token: string, interval = '1d', limit = 7): Promise<any> {
    return callTradeMCPTool('get_token_price_history', { token, interval, limit });
}

/** Get token balance for an account (CEP-18 tokens, not native CSPR) */
export async function getTokenBalance(publicKey: string, token?: string): Promise<any> {
    const args: any = { account_public_key: publicKey };
    if (token) args.token = token;
    return callTradeMCPTool('get_token_balance', args);
}

/** Get portfolio value across LP positions */
export async function getPortfolioValue(publicKey: string, currency = 'USD'): Promise<any> {
    return callTradeMCPTool('get_portfolio_value', { account_public_key: publicKey, currency });
}

/** Get swap history for an account */
export async function getSwapHistory(publicKey: string, page = 1, pageSize = 20): Promise<any> {
    return callTradeMCPTool('get_swap_history', { public_key: publicKey, page, page_size: pageSize });
}

export const csprTradeTools = {
    callTradeMCPTool,
    getTokens,
    getQuote,
    analyzeTrade,
    getPairs,
    getTokenPriceHistory,
    getTokenBalance,
    getPortfolioValue,
    getSwapHistory,
};
