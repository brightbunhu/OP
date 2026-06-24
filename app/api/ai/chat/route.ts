import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AI_TOOL_SCHEMAS, executeAiTool } from '@/lib/ai/tools';

export const dynamic = 'force-dynamic';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash';

// System prompt mapper based on active user security roles
function getSystemPrompt(userRoles: string[], name: string) {
  const roleStr = userRoles.length > 0 ? userRoles.join(', ') : 'CUSTOMER';
  
  let instructions = '';
  if (userRoles.includes('ADMIN')) {
    instructions = `Your active profile is ADMIN. You have unrestricted access to all tools including system health statistics, databases, audit logs, revenue analyses, and customer info. Execute operations when asked.`;
  } else if (userRoles.includes('MANAGER')) {
    instructions = `Your active profile is MANAGER. You have access to revenue analysis, cost of goods, net margins, inventory forecasting, and product catalogs. You DO NOT have permission to pull admin-only system reports or query audit logs. Decline admin-specific tools.`;
  } else if (userRoles.includes('SALES')) {
    instructions = `Your active profile is SALES. You can analyze sales velocity, track salesperson orders, and research customer insights/lifetime values. You DO NOT have permission to perform manager-level profit analyses or admin-level system reports. Decline them.`;
  } else {
    instructions = `Your active profile is CUSTOMER. You can query product prices, stock counts, manage shopping carts, and track your orders. You DO NOT have access to backend sales analysis, forecasting, margins, or system reports. If asked for business statistics, clearly state that you do not have permission.`;
  }

  return {
    role: 'system',
    content: `You are the OP Supermarket AI Assistant. Your user client name is "${name}".
Current User Permissions: [${roleStr}].
Security Rules:
- ${instructions}
- You must QUERY the database FIRST using your tools before answering questions about prices, inventory levels, order tracking, sales figures, margins, or system audits.
- NEVER invent or guess numerical data. If a tool returns no data or an error, convey that directly.
- Keep answers concise, helpful, and visually appealing using Markdown tables and bold points.
- If a user asks to perform an action (like adding a product to their cart), call the corresponding tool and report completion.`
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured on the server. Please add OPENROUTER_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // 1. Resolve User Session & Roles
    const session = await auth();
    const userId = session?.user?.id || null;
    const userRoles = (session?.user?.roles as string[]) || [];
    const userName = session?.user?.name || 'Guest Customer';

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Append system prompt at the beginning
    const systemPrompt = getSystemPrompt(userRoles, userName);
    let conversationHistory = [systemPrompt, ...messages];

    let loopCount = 0;
    const maxLoops = 6;
    let assistantMessage: { content: string; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> } | null = null;

    while (loopCount < maxLoops) {
      loopCount++;

      // 2. Fetch Completion from OpenRouter
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'OP Supermarket AI'
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
          tools: AI_TOOL_SCHEMAS,
          tool_choice: 'auto',
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error response:', errorText);
        return NextResponse.json({ error: `OpenRouter error: ${response.status} - ${errorText}` }, { status: response.status });
      }

      const responseData = await response.json();
      const choice = responseData.choices?.[0];
      if (!choice) {
        return NextResponse.json({ error: 'Empty choice returned from AI provider' }, { status: 502 });
      }

      assistantMessage = choice.message;

      if (!assistantMessage) {
        return NextResponse.json({ error: 'No message returned from AI provider' }, { status: 502 });
      }

      // 3. Check for Tool Calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Push the assistant message containing the tool request to history
        conversationHistory.push(assistantMessage);

        // Execute all tool calls concurrently
        const toolResults = await Promise.all(
          assistantMessage.tool_calls.map(async (toolCall: { id: string; function: { name: string; arguments: string } }) => {
            const { name, arguments: rawArgs } = toolCall.function;
            let parsedArgs = {};
            try {
              parsedArgs = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
            } catch (err) {
              console.warn(`Failed to parse arguments for tool ${name}:`, rawArgs);
            }

            console.log(`Executing AI Tool: ${name} with args`, parsedArgs);
            const output = await executeAiTool(name, parsedArgs, userId, userRoles);

            return {
              role: 'tool',
              tool_call_id: toolCall.id,
              name: name,
              content: JSON.stringify(output)
            };
          })
        );

        // Push all tool outputs to conversation history
        conversationHistory.push(...toolResults);
        
        // Loop back to fetch next completions response from AI with tool results included
        continue;
      }

      // If no tool calls, this is the final message to present to the user
      break;
    }

    return NextResponse.json({
      message: assistantMessage?.content || 'No response from AI',
      role: 'assistant'
    });

  } catch (e: unknown) {
    console.error('Error in AI Chat Route:', e);
    const errorMessage = e instanceof Error ? e.message : 'Internal server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
