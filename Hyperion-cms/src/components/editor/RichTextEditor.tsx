import { useEditor, EditorContent, Node, mergeAttributes } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon, Youtube as YoutubeIcon, Quote, Heading1, Heading2 } from 'lucide-react';

const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'video',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(HTMLAttributes, { controls: true, class: 'w-full rounded-xl my-4' })]
    },

    addCommands() {
        return {
            setVideo: (options: { src: string }) => ({ commands }: { commands: any }) => {
                return commands.insertContent({
                    type: 'video',
                    attrs: options,
                })
            },
        }
    },
});

const MenuBar = ({ editor, onImageRequest }: { editor: any, onImageRequest?: () => void }) => {
    if (!editor) {
        return null;
    }

    const buttonClass = (isActive: boolean) =>
        `p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`;

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 sticky top-0 bg-white z-10 sticky-menubar">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic'))}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </button>

            <div className="w-px bg-gray-200 mx-2 h-6 self-center"></div>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive('heading', { level: 1 }))}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive('heading', { level: 2 }))}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </button>

            <div className="w-px bg-gray-200 mx-2 h-6 self-center"></div>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'))}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList'))}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive('blockquote'))}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </button>

            <div className="w-px bg-gray-200 mx-2 h-6 self-center"></div>

            <button onClick={() => {
                if (onImageRequest) {
                    onImageRequest();
                } else {
                    const url = window.prompt('Image URL')
                    if (url) editor.chain().focus().setImage({ src: url }).run()
                }
            }} className={buttonClass(false)} title="Insert Media (Image/Video)">
                <ImageIcon className="h-4 w-4" />
            </button>
            <button onClick={() => {
                const url = window.prompt('URL')
                if (url) {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                }
            }} className={buttonClass(editor.isActive('link'))} title="Insert Link">
                <LinkIcon className="h-4 w-4" />
            </button>
            <button onClick={() => {
                const url = window.prompt('Youtube URL')
                if (url) {
                    editor.commands.setYoutubeVideo({ src: url })
                }
            }} className={buttonClass(editor.isActive('youtube'))} title="Insert Youtube">
                <YoutubeIcon className="h-4 w-4" />
            </button>
        </div>
    )
}

interface RichTextEditorProps {
    content?: string;
    onChange?: (html: string) => void;
    editable?: boolean;
    onImageRequest?: () => void;
    editorRef?: React.MutableRefObject<any>;
}

export function RichTextEditor({ content, onChange, editable = true, onImageRequest, editorRef }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            Youtube,
            VideoExtension,
            Placeholder.configure({ placeholder: 'Start writing your story...' }),
        ],
        content: content || '',
        editable,
        editorProps: {
            attributes: {
                class: 'prose prose-lg prose-blue max-w-none focus:outline-none min-h-[500px] p-8',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== undefined && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (editor && editorRef) {
            editorRef.current = editor;
        }
    }, [editor, editorRef]);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-blue-500 transition-shadow">
            <MenuBar editor={editor} onImageRequest={onImageRequest} />
            <EditorContent editor={editor} />
        </div>
    );
}
