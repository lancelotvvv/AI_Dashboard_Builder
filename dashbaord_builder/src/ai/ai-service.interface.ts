import type { DashboardSpec } from '@/schemas/dashboard.schema'
import type { AiTool } from './tools'

export interface ToolCall {
  name: string
  params: Record<string, unknown>
}

export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
}

export interface AiService {
  generateDashboard(prompt: string, currentSpec?: DashboardSpec): Promise<Partial<DashboardSpec>>
  getTools(): AiTool[]
  executeToolCall(call: ToolCall): Promise<ToolResult>
  chat(prompt: string, currentSpec: DashboardSpec): Promise<ToolCall[]>
}
