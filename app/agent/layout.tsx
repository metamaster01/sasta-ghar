// app/agent/layout.tsx
// Shared agent layout — sidebar + topbar separated.
// All agent/* pages use this layout automatically.
// Auth check happens here so individual pages don't need to repeat it.

import AgentLayoutClient from "@/components/agent/AgentLayoutClient";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <AgentLayoutClient>{children}</AgentLayoutClient>;
}