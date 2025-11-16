// Read-only renderer for craft.js serialized pages
import React from 'react';
import registry from './registry';

type NodesMap = Record<string, any>;

const normalizeSerialized = (obj: any): { nodes: NodesMap; rootNode: string } | null => {
  if (!obj || typeof obj !== 'object') return null;
  if (obj.nodes && (obj.rootNode || obj.root)) return { nodes: obj.nodes, rootNode: obj.rootNode ?? obj.root };
  if (obj.state && typeof obj.state === 'object') return normalizeSerialized(obj.state);

  const keys = Object.keys(obj);
  const looksLikeNodeMap = keys.length > 0 && keys.some(k => {
    const v = obj[k];
    return v && typeof v === 'object' && ('type' in v || 'props' in v || 'isCanvas' in v || 'nodes' in v);
  });
  if (looksLikeNodeMap) {
    let rootKey = 'ROOT';
    if (!keys.includes(rootKey)) {
      const isCanvasKey = keys.find(k => obj[k] && obj[k].isCanvas);
      rootKey = (isCanvasKey as string) ?? keys[0];
    }
    const normalized: NodesMap = {};
    keys.forEach(k => {
      const node = obj[k];
      if (node && typeof node === 'object') {
        const copy = { ...node };
        if (copy.type && typeof copy.type === 'object' && 'resolvedName' in copy.type) {
          copy.type = (copy.type as any).resolvedName;
        }
        normalized[k] = copy;
      } else {
        normalized[k] = node;
      }
    });
    return { nodes: normalized, rootNode: rootKey };
  }
  return null;
};

const renderNode = (nodeId: string, nodes: NodesMap): React.ReactNode => {
  const node = nodes[nodeId];
  if (!node) return null;
  const data = node.data ?? node;
  const type = data?.type ?? data?.resolvedName ?? data?.displayName ?? data?.type;
  const props = data?.props ?? {};
  const childNodeIds: string[] = node.nodes ?? node.data?.nodes ?? [];

  const Comp = (typeof type === 'string' && (registry as any)[type]) || (registry as any)[type?.resolvedName] || (registry as any).__FALLBACK__;

  // Ensure children produced for lists include keys to satisfy React warnings
  const children = (childNodeIds || []).map((childId) => (
    <React.Fragment key={childId}>{renderNode(childId, nodes)}</React.Fragment>
  ));

  try {
    if (Comp === (registry as any).__FALLBACK__) {
      return <Comp type={type} props={props}>{children}</Comp>;
    }
    return <Comp {...props}>{children}</Comp>;
  } catch (e) {
    console.error('ReadOnlyRenderer.renderNode error', e, { nodeId, type, props });
    return <div style={{ color: 'red' }}>Render error</div>;
  }
};

export const ReadOnlyRenderer: React.FC<{ serialized: any; registryOverride?: Record<string, React.ComponentType<any>> }> = ({ serialized, registryOverride }) => {
  const input = typeof serialized === 'string' ? (() => { try { return JSON.parse(serialized); } catch (e) { return serialized; } })() : serialized;
  const normalized = normalizeSerialized(input) || (input && input.nodes ? { nodes: input.nodes, rootNode: input.rootNode ?? input.root } : null);

  if (!normalized) {
    if (typeof serialized === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: serialized }} />;
    }
    return <div>No content</div>;
  }

  if (registryOverride) {
    // shallow-merge overrides for testing or extension
    Object.assign((registry as any), registryOverride);
  }

  const rootId = normalized.rootNode;
  const nodes = normalized.nodes;
  const rootNode = nodes[rootId];
  if (!rootNode) {
    return <div>Empty page</div>;
  }

  const childIds = rootNode.nodes ?? rootNode.data?.nodes ?? [];
  if (childIds && childIds.length > 0) {
    return <div>{childIds.map((id: string) => <React.Fragment key={id}>{renderNode(id, nodes)}</React.Fragment>)}</div>;
  }
  return <div>{renderNode(rootId, nodes)}</div>;
};

export default ReadOnlyRenderer;
