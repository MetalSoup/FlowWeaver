import React, {useEffect, useState} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { eclipse } from '@uiw/codemirror-theme-eclipse';

interface HtmlEditorProps {
    value: string;
    onChange: (html: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function HtmlEditor({ value, onChange, disabled = false, className = '' }: HtmlEditorProps) {
    const [internal, setInternal] = useState<string>(value || '');

    useEffect(() => {
        setInternal(value || '');
    }, [value]);

    return (
        <div className={"html-editor min-w-[600px] " + className}>
            {/* Scoped styles to ensure the CodeMirror caret/cursor is visible on any theme */}
            <style>{`
                /* Make the caret visible: CodeMirror 6 uses .cm-cursor (a thin border) */
                .html-editor .cm-cursor {
                    border-left-width: 2px !important;
                    border-left-style: solid !important;
                    border-left-color: rgba(0,0,0,0.85) !important; /* dark caret */
                }

                /* Also set caret-color for browsers and accessibility */
                .html-editor .cm-content {
                    caret-color: rgba(0,0,0,0.85) !important;
                }

                /* For focused editors sometimes the cursor uses a different class */
                .html-editor .cm-editor.cm-focused .cm-cursor {
                    border-left-color: rgba(0,0,0,0.95) !important;
                }
            `}</style>

            <div className="toolbar mb-2 flex gap-2">
                {/* toolbar left intentionally minimal for now; WYSIWYG removed */}
            </div>

            <CodeMirror
                value={internal}
                height="160px"
                extensions={[html(), eclipse]}
                onChange={(v) => { setInternal(v); onChange(v); }}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLine: false,
                }}
                readOnly={disabled}
            />
        </div>
    );
}
