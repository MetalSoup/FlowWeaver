import React from 'react';
import { Editor as CraftEditor, Frame, Element } from '@craftjs/core';

import { Container, Text } from './Components/Selectors';
import { Button } from './Components/Selectors/Button';
import { Custom1, OnlyButtons } from './Components/Selectors/Custom1';
import { Custom2, Custom2VideoDrop } from './Components/Selectors/Custom2';
import { Custom3 } from './Components/Selectors/Custom3';
import { Video } from './Components/Selectors/Video';
import { RenderNode } from './Components/Editor/RenderNode';
import { Flow}  from "@/Pages/Pages/Components/Selectors/Flow";

type PageLike = {
    content?: any;
    data?: { content?: any };
    model?: { content?: any };
    [key: string]: any;
};

export default function Show(props: any) {
    // Accept a few common server prop shapes (page, data.page, model, etc.)
    const page = (props?.page ?? props) as PageLike;
    const rawContent = page?.content ?? page?.data?.content ?? page?.model?.content ?? '';

    // Helper: safely parse JSON and return either the parsed value or the original.
    const tryParse = (value: any) => {
        if (value === null || value === undefined) return { ok: false, parsed: null };
        if (typeof value !== 'string') return { ok: true, parsed: value };
        try {
            return { ok: true, parsed: JSON.parse(value) };
        } catch (e) {
            return { ok: false, parsed: null };
        }
    };

    // Helper: heuristics to decide whether an object looks like a Craft.js node map/tree
    const looksLikeNodeTree = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object') return false;
        if (obj.nodes || obj.state || obj.root || obj.rootNode) return true;

        // Some builds emit a map of nodes keyed by id — check values for typical node props
        try {
            const values = Object.values(obj);
            if (!Array.isArray(values) || values.length === 0) return false;
            return values.some((v: any) => v && typeof v === 'object' && (
                'type' in v || 'isCanvas' in v || 'props' in v || 'nodes' in v
            ));
        } catch (e) {
            return false;
        }
    };

    // Determine if the content is serialized craft JSON.
    const { ok: parsedOk, parsed } = tryParse(rawContent);
    const isSerialized = parsedOk && looksLikeNodeTree(parsed);

    // Craft resolver (same building blocks used by the editor)
    const resolver: Record<string, any> = {
        Container,
        Text,
        Custom1,
        Custom2,
        Custom2VideoDrop,
        Custom3,
        Custom3BtnDrop: (Custom3 as any).BtnDrop || (Custom3 as any),
        OnlyButtons,
        Button,
        Video,
        Flow
    };

    // Build Frame children depending on whether the content is serialized craft JSON or legacy HTML
    const initialChildren = (() => {
        if (isSerialized) {
            // If serialized craft JSON, pass the parsed object via `data` so Craft can render it
            // parsed has already been produced by tryParse above and is safe to pass
            if (parsed && typeof parsed === 'object') {
                return <Frame data={parsed} />;
            }

            // Fall back to sending the raw string if parsing unexpectedly failed
            const fallback = typeof rawContent === 'string' && rawContent.length > 0 ? rawContent : '<h2>New page</h2>';
            return <Frame json={fallback} />;
        }

        // Not serialized: treat as legacy HTML and render inside a Text node
        const initialText = typeof rawContent === 'string' && rawContent.length > 0 ? rawContent : '<h2>New page</h2>';

        return (
            <Frame json={initialText}>
                <Element canvas is={Container} custom={{ displayName: 'Root' }}>
                    <Text text={initialText} />
                </Element>
            </Frame>
        );
    })();

    return (
        <div className="w-full">
            <CraftEditor resolver={resolver} enabled={false} onRender={RenderNode}>
                {initialChildren}
            </CraftEditor>
        </div>
    );
}
