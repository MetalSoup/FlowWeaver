// Read-only renderer for craft.js serialized pages
import React from 'react';
import DOMPurify from 'dompurify';
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

  // Special-case Html nodes so we can reliably interleave HTML fragments and child nodes
  if (typeof type === 'string' && type === 'Html') {
    try {
      const html = props?.html ?? '';
      const parts = String(html || '').split(new RegExp('\\[placeholder]', 'i'));

      // linkedNodes sometimes maps placeholder slot keys (html_placeholder_0) to node ids
      const linkedMap: Record<string, string> = (node.linkedNodes ?? node.data?.linkedNodes) || {};
      const rendered = new Set<string>();

      const renderedFragments = parts.map((part: string, idx: number) => {
        // determine the target for this placeholder: prefer explicit child node, then linkedNodes
        const placeholderKey = `html_placeholder_${idx}`;
        const target = (childNodeIds && childNodeIds[idx]) || linkedMap[placeholderKey];

        let placeholderContent: React.ReactNode = null;
        if (target) {
          // If the target is a placeholder node (canvas), it will usually contain its own child nodes
          const targetNode = nodes[target];
          if (targetNode && Array.isArray(targetNode.nodes) && targetNode.nodes.length > 0) {
            // render each child inside the placeholder node
            placeholderContent = targetNode.nodes.map((nid: string) => {
              rendered.add(nid);
              return <React.Fragment key={nid}>{renderNode(nid, nodes)}</React.Fragment>;
            });
          } else {
            // render the target node itself
            rendered.add(target);
            placeholderContent = <React.Fragment key={target}>{renderNode(target, nodes)}</React.Fragment>;
          }
        }

        return (
          <React.Fragment key={idx}>
            {part ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(part) }} /> : null}
            {idx < parts.length - 1 ? placeholderContent : null}
          </React.Fragment>
        );
      });

      // Render any remaining child nodes (that were not consumed via placeholders)
      const remainingChildren = (childNodeIds || []).filter((cid) => !rendered.has(cid)).map((cid) => (
        <React.Fragment key={cid}>{renderNode(cid, nodes)}</React.Fragment>
      ));

      // Also render any nodes referenced in linkedMap values that weren't consumed above
      const linkedValues = Object.values(linkedMap).filter(Boolean) as string[];
      const remainingLinked = linkedValues
        .filter((lid) => {
          // if the linked node itself contains children, those children were already rendered and marked
          if (nodes[lid] && Array.isArray(nodes[lid].nodes) && nodes[lid].nodes.length > 0) {
            return nodes[lid].nodes.some((cid: string) => !rendered.has(cid));
          }
          return !rendered.has(lid);
        })
        .map((lid) => {
          if (nodes[lid] && Array.isArray(nodes[lid].nodes) && nodes[lid].nodes.length > 0) {
            return nodes[lid].nodes.filter((cid: string) => !rendered.has(cid)).map((cid: string) => <React.Fragment key={cid}>{renderNode(cid, nodes)}</React.Fragment>);
          }
          return <React.Fragment key={lid}>{renderNode(lid, nodes)}</React.Fragment>;
        });

      return (
        <div>
          {renderedFragments}
          {remainingChildren}
          {remainingLinked}
        </div>
      );
    } catch (e) {
      console.error('ReadOnlyRenderer.renderNode Html error', e, { nodeId, props });
      return <div style={{ color: 'red' }}>Html render error</div>;
    }
  }

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
