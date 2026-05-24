import React from 'react';
import { useEditor, EditorContent, Mark, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ImageResize from 'tiptap-extension-resize-image';
import { Box, IconButton, Divider, Tooltip, Typography, Paper } from '@mui/material';
import { 
    FiBold, FiItalic, FiType, FiList, FiImage, FiMinus, FiCode
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote, MdStrikethroughS } from 'react-icons/md';
import { getOptimizedImage } from '../../lib/media';

const SubtitleMark = Mark.create({
    name: 'subtitle',
    parseHTML() {
        return [
            { tag: 'span[data-type="subtitle"]' },
            {
                tag: 'span',
                getAttrs: element => {
                    const el = element as HTMLElement;
                    return el.style.color === 'var(--text-muted)' || el.style.color === 'rgb(142, 142, 147)' ? {} : false;
                }
            }
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 
            'data-type': 'subtitle',
            style: 'color: var(--text-muted); font-style: italic; opacity: 0.8; font-weight: 400;' 
        }), 0];
    },
});

const MenuBar = ({ editor }: any) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            const optimizedUrl = getOptimizedImage(url);
            editor.chain().focus().setImage({ src: optimizedUrl }).run();
        }
    };

    const getBtnColor = (isActive: boolean) => isActive ? 'primary' : 'default';
    const getBtnStyle = (isActive: boolean) => ({
        bgcolor: isActive ? 'primary.main' : 'transparent',
        color: isActive ? 'primary.contrastText' : 'text.primary',
        borderRadius: 2,
        '&:hover': {
            bgcolor: isActive ? 'primary.dark' : 'action.hover',
        }
    });

    return (
        <Box sx={{ 
            display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1, 
            borderBottom: '1px solid', borderColor: 'divider', 
            bgcolor: 'background.default'
        }}>
            <Tooltip title="Bold"><IconButton size="small" onClick={() => editor.chain().focus().toggleBold().run()} sx={getBtnStyle(editor.isActive('bold'))}><FiBold size={18} /></IconButton></Tooltip>
            <Tooltip title="Italic"><IconButton size="small" onClick={() => editor.chain().focus().toggleItalic().run()} sx={getBtnStyle(editor.isActive('italic'))}><FiItalic size={18} /></IconButton></Tooltip>
            <Tooltip title="Strikethrough"><IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} sx={getBtnStyle(editor.isActive('strike'))}><MdStrikethroughS size={18} /></IconButton></Tooltip>
            <Tooltip title="English Subtitle">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleMark('subtitle').run()} sx={getBtnStyle(editor.isActive('subtitle'))}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic',  fontWeight: 800,  px: 0.5 }}>sub</Typography>
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Heading 2">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} sx={getBtnStyle(editor.isActive('heading', { level: 2 }))}>
                    <Typography variant="body2" sx={{ fontWeight: 800,  px: 0.5 }}>H2</Typography>
                </IconButton>
            </Tooltip>
            <Tooltip title="Heading 3">
                <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} sx={getBtnStyle(editor.isActive('heading', { level: 3 }))}>
                    <Typography variant="body2" sx={{ fontWeight: 800,  px: 0.5 }}>H3</Typography>
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Bullet List"><IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} sx={getBtnStyle(editor.isActive('bulletList'))}><FiList size={18} /></IconButton></Tooltip>
            <Tooltip title="Numbered List"><IconButton size="small" onClick={() => editor.chain().focus().toggleOrderedList().run()} sx={getBtnStyle(editor.isActive('orderedList'))}><MdFormatListNumbered size={18} /></IconButton></Tooltip>
            <Tooltip title="Blockquote"><IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} sx={getBtnStyle(editor.isActive('blockquote'))}><MdFormatQuote size={18} /></IconButton></Tooltip>
            <Tooltip title="Code Block"><IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} sx={getBtnStyle(editor.isActive('codeBlock'))}><FiCode size={18} /></IconButton></Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Insert Image"><IconButton size="small" onClick={addImage} sx={getBtnStyle(false)}><FiImage size={18} /></IconButton></Tooltip>
            <Tooltip title="Horizontal Rule"><IconButton size="small" onClick={() => editor.chain().focus().setHorizontalRule().run()} sx={getBtnStyle(false)}><FiMinus size={18} /></IconButton></Tooltip>
        </Box>
    );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: any) => {

    const formatHTML = (raw: string) => {
        if (!raw) return '';
        let html = raw;
        if (!/<(p|h[1-6]|ul|ol|li|div|pre|blockquote)[> \/]/i.test(html)) {
            html = html.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>').join('');
        }
        // Fix legacy content that used <br> for paragraph separation
        html = html.replace(/<br\s*\/?>/gi, '</p><p>');
        return html;
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
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

    React.useEffect(() => {
        if (editor) {
            const formatted = formatHTML(content);
            if (content !== editor.getHTML() && formatted !== editor.getHTML()) {
                editor.commands.setContent(formatted, { emitUpdate: false });
            }
        }
    }, [content, editor]);

    return (
        <Paper elevation={0} sx={{ 
            display: 'flex', flexDirection: 'column', 
            bgcolor: 'background.paper', borderRadius: 0,
            '& .ProseMirror': {
                p: 3, outline: 'none', minHeight: 200,
                color: 'text.primary',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                '& p': { mb: 2 },
                '& h2': { fontSize: '1.5rem', fontWeight: 800, mt: 3, mb: 1.5 },
                '& h3': { fontSize: '1.25rem', fontWeight: 700, mt: 2.5, mb: 1 },
                '& blockquote': {
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    pl: 2,
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    bgcolor: 'background.default',
                    py: 1,
                    pr: 2,
                    borderRadius: '0 8px 8px 0'
                },
                '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
                '& code': { bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, fontFamily: 'monospace' },
                '& pre': { bgcolor: 'action.hover', p: 2, borderRadius: 2, overflowX: 'auto', fontFamily: 'monospace' },
                '& ul, & ol': { pl: 3, mb: 2 },
                '& li': { mb: 0.5 },
                '& p.is-editor-empty:first-of-type::before': {
                    content: 'attr(data-placeholder)',
                    float: 'left',
                    color: 'text.disabled',
                    pointerEvents: 'none',
                    height: 0,
                }
            }
        }}>
            <MenuBar editor={editor} />
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <EditorContent editor={editor} />
            </Box>
        </Paper>
    );
};

export default RichTextEditor;
