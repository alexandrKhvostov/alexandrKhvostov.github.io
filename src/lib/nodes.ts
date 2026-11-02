/** Every id a connection may point to. Kind `project` means a planned project page (the slug is the id);
 *  other kinds exist only on the system map and never get a page of their own. */

export type NodeKind = "project" | "client" | "storage" | "cdn" | "backend" | "service";

export interface NodeInfo {
  label: string;
  kind: NodeKind;
}

export const nodes = {
  "auth-service": { label: "Auth service", kind: "project" },
  "quiz-builder": { label: "Quiz builder MCP", kind: "project" },
  "media-storage": { label: "Media storage MCP", kind: "project" },
  "quiz-library": { label: "Quiz library", kind: "project" },
  "dualio-web": { label: "Dualio web funnels", kind: "project" },
  "dualio-app": { label: "Dualio app", kind: "project" },
  luvea: { label: "Luvea", kind: "project" },
  "voice-journaling": { label: "Voice journaling platform", kind: "project" },
  "mcp-template": { label: "MCP template", kind: "project" },
  "frontend-template": { label: "Frontend template", kind: "project" },
  "family-budget": { label: "Family budget", kind: "project" },
  "growio-app": { label: "Growio app", kind: "project" },
  "growio-cms": { label: "Growio CMS", kind: "project" },
  "ai-clients": { label: "AI clients", kind: "client" },
  s3: { label: "S3 bucket", kind: "storage" },
  cloudfront: { label: "CloudFront", kind: "cdn" },
  "product-backends": { label: "Product backends", kind: "backend" },
  "cms-mcp": { label: "CMS MCP", kind: "service" },
} as const satisfies Record<string, NodeInfo>;

export type NodeId = keyof typeof nodes;

export function isNodeId(id: string): id is NodeId {
  return Object.hasOwn(nodes, id);
}

/** True for ids that may have a page (planned or built). */
export function isProjectNode(id: string): boolean {
  return isNodeId(id) && nodes[id].kind === "project";
}

export function nodeInfo(id: string): NodeInfo | undefined {
  return isNodeId(id) ? nodes[id] : undefined;
}

/** The label of a registered node; throws for an unknown id so a typo cannot reach the page. */
export function nodeLabel(id: string): string {
  const info = nodeInfo(id);
  if (!info) throw new Error(`"${id}" is not in the node registry (src/lib/nodes.ts).`);
  return info.label;
}
