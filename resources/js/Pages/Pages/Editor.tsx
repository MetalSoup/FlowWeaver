import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';

// Craft.js
import { Editor as CraftEditor, Frame, Element, useEditor } from '@craftjs/core';

// Local editor building blocks (already present in the repo)
import { Viewport, RenderNode } from './Components/Editor';
import { Container, Text } from './Components/Selectors';
import { Button } from './Components/Selectors/Button';
import { Custom1, OnlyButtons } from './Components/Selectors/Custom1';
import { Custom2, Custom2VideoDrop } from './Components/Selectors/Custom2';
import { Custom3 } from './Components/Selectors/Custom3';
import { Video } from './Components/Selectors/Video';

export default function Editor({ auth, page = null, forms = {}, flows = [] }: { auth: any; page?: any; forms?: any; flows?: any }) {
    const isEditing = !!page;

    const { data, setData, post, put, processing, errors } = useForm({
        name: page?.name ?? '',
        content: page?.content ?? '',
    });

    const [message, setMessage] = useState<string | null>(null);

    // A ref that will be populated by EditorInitializer with the craftjs API (actions + query)
    const editorApiRef = useRef<any>(null);

    // Helper to detect if stored content is serialized craft JSON
    const isSerialized = (() => {
        if (!page?.content) return false;
        try {
            const parsed = JSON.parse(page.content);
            // basic shape check: craft serialized object often has "nodes" or "state"
            return typeof parsed === 'object' && (parsed.nodes || parsed.state || parsed.root || parsed.rootNode || true);
        } catch (e) {
            return false;
        }
    })();

    // Save: serialize craft state (if available) into content and submit to server
    const save = async () => {
        // If we have a craft editor, serialize it; otherwise keep existing content
        if (editorApiRef.current && editorApiRef.current.query) {
            const serialized = editorApiRef.current.query.serialize();
            const payload = JSON.stringify(serialized);
            setData('content', payload);
        }

        if (isEditing) {
            put(route('pages.update', page.id), {
                onSuccess: () => {
                    setMessage('Saved');
                    window.setTimeout(() => setMessage(null), 2000);
                },
            });
        } else {
            post(route('pages.store'), {
                onSuccess: () => {
                    setMessage('Created');
                    window.setTimeout(() => setMessage(null), 2000);
                },
            });
        }
    };

    // Expose save to keyboard shortcut (Ctrl/Cmd+S)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                save();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [data]);

    // EditorInitializer runs inside Craft Editor context so it can access useEditor
    const EditorInitializer: React.FC<{ pageContent?: string }> = ({ pageContent }) => {
        // useEditor must be called inside the Craft editor context (this component is rendered inside <CraftEditor>)
        const { actions, query } = useEditor(() => ({}));

        // expose API
        useEffect(() => {
            editorApiRef.current = { actions, query };
            return () => {
                editorApiRef.current = null;
            };
        }, [actions, query]);

        // If editing and we have serialized craft JSON, deserialize it
        useEffect(() => {
            if (!pageContent) return;

            try {
                const parsed = JSON.parse(pageContent);
                // `actions.deserialize` expects the serialized object used by craft
                if (actions && typeof actions.deserialize === 'function') {
                    actions.deserialize(parsed);
                }
            } catch (e) {
                // not JSON — nothing to do; the initial Frame will render legacy HTML as a Text node
            }
        }, [pageContent, actions]);

        return null;
    };

    // Build a simple header with Save/Cancel
    const header = (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-lg font-semibold">{isEditing ? `Edit Page: ${page?.name ?? ''}` : 'Create Page'}</h1>
                {errors && (errors.name || errors.content) ? (
                    <div className="mt-2 text-sm text-red-600">
                        {errors.name && <div>{errors.name}</div>}
                        {errors.content && <div>{errors.content}</div>}
                    </div>
                ) : null}
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={save} disabled={processing} className="bg-blue-600 text-white px-4 py-2 rounded">
                    {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Page'}
                </button>
                <a href={route('pages.index')} className="text-sm text-gray-600">Cancel</a>
                {message && <span className="text-sm text-green-600">{message}</span>}
            </div>
        </div>
    );

    // Resolver for craft components
    const resolver = {
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
    } as any;

    // Initial children: if we don't have serialized content, render a basic canvas containing the existing HTML (legacy)
    const initialChildren = (() => {
        if (isSerialized) {
            // When serialized we'll rely on actions.deserialize in initializer — so render an empty Frame
            return (
                <Frame>
                    <Element canvas is={Container} custom={{ displayName: 'Root' }}>
                        {/* empty root - content will be injected by deserialize */}
                    </Element>
                </Frame>
            );
        }

        // Not serialized: show a simple initial canvas containing the legacy HTML (or a placeholder)
        const initialText = page?.content ?? '<h2>New page</h2>';

        return (
            <Frame>
                <Element canvas is={Container} custom={{ displayName: 'Root' }}>
                    <Text text={initialText} />
                </Element>
            </Frame>
        );
    })();

    return (
        <DashboardLayout user={auth.user} header={header}>
            <Head title={isEditing ? `Edit: ${page?.name || 'Page'}` : 'Create Page'} />

            <div className="h-full">
                <CraftEditor resolver={resolver} onRender={RenderNode}>
                    {/* initializer must be rendered inside the editor so useEditor works */}
                    <EditorInitializer pageContent={page?.content} />

                    <Viewport>
                        {initialChildren}
                    </Viewport>
                </CraftEditor>

                {/* Hidden form field so Inertia has the latest content if user navigates away using other flows */}
                <input type="hidden" value={data.content} />

                {/* Non-intrusive lists to use the passed forms/flows so they're available to editors */}
                <div className="p-4 text-sm text-gray-700">
                    {flows && flows.length > 0 && (
                        <div>
                            <strong>Flows:</strong> {flows.map((f: any) => f.name).join(', ')}
                        </div>
                    )}
                    {forms && Object.keys(forms).length > 0 && (
                        <div className="mt-2">
                            <strong>Forms:</strong> {Object.keys(forms).length}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
