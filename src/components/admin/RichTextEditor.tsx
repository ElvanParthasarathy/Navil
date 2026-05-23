import React from 'react';
import { useEditor, EditorContent, Mark, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import ImageResize from 'tiptap-extension-resize-image';
import { getOptimizedImage } from '../../lib/media';

const SubtitleMark = Mark.create({
    name: 'subtitle',

    parseHTML() {
        return [
            {
                tag: 'span[data-type="subtitle"]',
            },
            {
                tag: 'span',
                getAttrs: element => {
                    const el = element as HTMLElement;
                    return el.style.color === 'var(--text-muted)' || el.style.color === 'rgb(142, 142, 147)' ? {} : false;
                }
            }
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 
            'data-type': 'subtitle',
            style: 'color: var(--text-muted); font-style: italic; opacity: 0.8; font-weight: 400;' 
        }), 0]
    },
});

const MenuBar = ({ editor }) => {
    if (!editor) return null;

    const btnStyle = (isActive) => ({
        background: isActive ? 'var(--text-main)' : 'transparent',
        color: isActive ? 'var(--bg-app)' : 'var(--text-muted)',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 600,
        transition: 'all 0.15s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
    });

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            const optimizedUrl = getOptimizedImage(url);
            editor.chain().focus().setImage({ src: optimizedUrl }).run();
        }
    };

    return (
        <div className="rte-toolbar">
            <button type="button" style={btnStyle(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                <strong>B</strong>
            </button>
            <button type="button" style={btnStyle(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                <em>I</em>
            </button>
            <button type="button" style={btnStyle(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
                <s>S</s>
            </button>
            <button type="button" style={{ ...btnStyle(editor.isActive('subtitle')), fontStyle: 'italic', fontWeight: 'bold' }} onClick={() => editor.chain().focus().toggleMark('subtitle').run()} title="English Subtitle">
                English Subtitle
            </button>

            <div className="rte-toolbar-divider" />

            <button type="button" style={btnStyle(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
                H2
            </button>
            <button type="button" style={btnStyle(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
                H3
            </button>

            <div className="rte-toolbar-divider" />

            <button type="button" style={btnStyle(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
                • List
            </button>
            <button type="button" style={btnStyle(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
                1. List
            </button>
            <button type="button" style={btnStyle(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
                ❝
            </button>
            <button type="button" style={btnStyle(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block">
                {'</>'}
            </button>

            <div className="rte-toolbar-divider" />

            <button type="button" style={btnStyle(false)} onClick={addImage} title="Insert Image">
                🖼
            </button>
            <button type="button" style={btnStyle(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
                ―
            </button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }) => {

    // Convert plain text with newlines to HTML paragraphs for legacy data
    const formatHTML = (raw) => {
        if (!raw) return '';
        // If it already contains HTML block/inline tags, assume it's HTML
        if (/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) return raw;
        // Otherwise, convert newlines to <p> tags
        return raw.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>').join('');
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                hardBreak: false, // We add our own below
            }),
            // Enter = line break (<br>), Shift+Enter = new paragraph
            HardBreak.extend({
                addKeyboardShortcuts() {
                    return {
                        'Enter': () => this.editor.commands.setHardBreak(),
                        'Shift-Enter': () => {
                            this.editor.commands.splitBlock();
                            return true;
                        },
                    };
                },
            }),
            ImageResize.configure({ inline: false }),
            Placeholder.configure({ placeholder }),
            SubtitleMark,
        ],
        content: formatHTML(content),
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Sync external content changes
    React.useEffect(() => {
        if (editor) {
            const formatted = formatHTML(content);
            if (content !== editor.getHTML() && formatted !== editor.getHTML()) {
                editor.commands.setContent(formatted, { emitUpdate: false });
            }
        }
    }, [content]);

    return (
        <div className="rte-wrapper">
            <style>{`
                .rte-wrapper {
                    border: 1px solid var(--border-color, #333);
                    border-radius: 12px;
                    overflow: hidden;
                    background: var(--bg-app);
                }
                .rte-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    padding: 8px 12px;
                    background: color-mix(in srgb, var(--text-main) 4%, transparent);
                    border-bottom: 1px solid var(--border-color, #333);
                }
                .rte-toolbar-divider {
                    width: 1px;
                    margin: 4px 6px;
                    background: var(--border-color, #333);
                    opacity: 0.4;
                }
                .rte-wrapper .tiptap {
                    padding: 20px 24px;
                    min-height: 300px;
                    max-height: 600px;
                    overflow-y: auto;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    outline: none;
                }
                .rte-wrapper .tiptap p {
                    margin: 0;
                }
                .rte-wrapper .tiptap span[data-type="subtitle"] {
                    color: var(--text-muted) !important;
                    font-style: italic !important;
                    opacity: 0.8 !important;
                    font-weight: 400 !important;
                }
                .rte-wrapper .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    color: color-mix(in srgb, var(--text-muted) 40%, transparent);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
                .rte-wrapper .tiptap h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 24px 0 8px;
                }
                .rte-wrapper .tiptap h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 20px 0 6px;
                }
                .rte-wrapper .tiptap blockquote {
                    border-left: 3px solid var(--border-color, #555);
                    padding-left: 16px;
                    margin: 16px 0;
                    color: var(--text-muted);
                    font-style: italic;
                }
                .rte-wrapper .tiptap pre {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    padding: 16px;
                    border-radius: 8px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9rem;
                    overflow-x: auto;
                }
                .rte-wrapper .tiptap code {
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9em;
                }
                .rte-wrapper .tiptap img {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 16px 0;
                }
                .rte-wrapper .tiptap ul, .rte-wrapper .tiptap ol {
                    padding-left: 24px;
                    margin: 12px 0;
                }
                .rte-wrapper .tiptap hr {
                    border: none;
                    border-top: 1px solid var(--border-color, #333);
                    margin: 24px 0;
                }
            `}</style>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
