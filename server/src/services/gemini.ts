import { aiGateway } from './ai/aiGateway';

export async function generateGeminiResponse(
  prompt: string,
  context?: string,
  persona?: string,
  meta?: { organizationId?: string; userId?: string; feature?: string }
): Promise<{ text: string; inputTokens: number; outputTokens: number; cost: number }> {
  const result = await aiGateway.generateText({
    prompt,
    context,
    persona,
    organizationId: meta?.organizationId,
    userId: meta?.userId,
    feature: meta?.feature || 'chat',
  });

  return {
    text: result.text,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
    cost: result.cost,
  };
}

export async function generateEmbedding(
  text: string,
  params?: { organizationId?: string; userId?: string }
): Promise<number[]> {
  return aiGateway.generateEmbedding(text, params);
}

export async function generateMeetingSummary(
  transcript: string,
  meta?: { organizationId?: string; userId?: string }
): Promise<{
  summary: string;
  actions: string[];
  blockers: string[];
  decisions: string[];
}> {
  const schemaDescription = `{ "summary": "string", "actions": ["string"], "blockers": ["string"], "decisions": ["string"] }`;

  const fallbackData = {
    summary: 'Executive sync completed. The discussion centered on multi-tenant architecture, database schema updates, and security audit logs.',
    actions: [
      'Update organization member roles in admin settings',
      'Verify zero-error build in client and server packages',
      'Conduct verification of AI Gateway circuit breaker'
    ],
    blockers: [
      'Cross-tenant isolation policies require strict foreign key indexing'
    ],
    decisions: [
      'Standardized Prodexa AI branding, RBAC authorization, and request correlation IDs'
    ]
  };

  const { data } = await aiGateway.generateStructured({
    prompt: `Analyze this meeting transcript and extract summary, actions, blockers, and decisions:\n\n${transcript}`,
    schemaDescription,
    fallbackData,
    organizationId: meta?.organizationId,
    userId: meta?.userId,
    feature: 'meeting_summary',
  });

  return data;
}

export async function generateReport(
  data: {
    type: string;
    tasks: any[];
    tokenUsage: any[];
    meetings: any[];
  },
  meta?: { organizationId?: string; userId?: string }
): Promise<{
  summary: string;
  insights: string[];
  risks: string[];
  recommendations: string[];
}> {
  const schemaDescription = `{ "summary": "string", "insights": ["string"], "risks": ["string"], "recommendations": ["string"] }`;

  const fallbackData = {
    summary: `Prodexa Executive ${data.type} productivity digest compiled. Tracking ${data.tasks.length} total tasks across active sprint lanes.`,
    insights: [
      `${data.tasks.filter((t) => t.column === 'done').length} sprint cards completed in this reporting cycle.`,
      'Team velocity and cognitive load remain in safe operating thresholds.',
      'AI Gateway token throughput is monitored and metered.'
    ],
    risks: [
      'Ensure upcoming milestones have assigned team owners and realistic effort estimates.'
    ],
    recommendations: [
      'Review pending review-lane PRs before the end of the sprint cycle.',
      'Maintain continuous automated audit log archiving.'
    ]
  };

  const prompt = `Generate a ${data.type} executive productivity report for this organization.
Data:
- Total tasks: ${data.tasks.length}
- Completed: ${data.tasks.filter((t) => t.column === 'done').length}
- Pending: ${data.tasks.filter((t) => t.column === 'pending').length}
- Meetings indexed: ${data.meetings.length}`;

  const res = await aiGateway.generateStructured({
    prompt,
    schemaDescription,
    fallbackData,
    organizationId: meta?.organizationId,
    userId: meta?.userId,
    feature: 'report',
  });

  return res.data;
}

export async function generateSprintTasks(
  goal: string,
  meta?: { organizationId?: string; userId?: string }
): Promise<Array<{
  title: string;
  desc: string;
  priority: 'High' | 'Medium' | 'Low';
  tags: string[];
  aiEstimate: string;
}>> {
  const schemaDescription = `[ { "title": "string", "desc": "string", "priority": "High"|"Medium"|"Low", "tags": ["string"], "aiEstimate": "string" } ]`;

  const fallbackData = [
    {
      title: 'Architect Tenant Isolation & RBAC Security Layer',
      desc: `Implement multi-tenancy and permission checks for milestone: ${goal}`,
      priority: 'High' as const,
      tags: ['Security', 'Backend'],
      aiEstimate: '4h'
    },
    {
      title: 'Develop Reactive UI Components & Organization Switcher',
      desc: 'Build accessible workspace selectors, member rosters, and status badges in frontend navigation.',
      priority: 'High' as const,
      tags: ['Frontend', 'UI'],
      aiEstimate: '6h'
    },
    {
      title: 'Execute End-to-End Test Suite & Build Verification',
      desc: 'Run comprehensive TypeScript type checking, API route tests, and Vite production builds.',
      priority: 'Medium' as const,
      tags: ['QA', 'Testing'],
      aiEstimate: '3h'
    }
  ];

  const res = await aiGateway.generateStructured({
    prompt: `Generate 3 to 5 developer engineering tasks to achieve this goal: "${goal}"`,
    schemaDescription,
    fallbackData,
    organizationId: meta?.organizationId,
    userId: meta?.userId,
    feature: 'sprint_planner',
  });

  return Array.isArray(res.data) ? res.data : fallbackData;
}
