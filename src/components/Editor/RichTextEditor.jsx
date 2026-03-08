import React from 'react'
import { useEditor, EditorContent, Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, List, ListOrdered,
  Quote, Minus, Highlighter, Undo, Redo,
  IndentIcon,
} from 'lucide-react'

// ─── Tab indent extension ─────────────────────────────────────────────────────
// Tab inserts a paragraph indent (4 non-breaking spaces = one em-indent).
// Shift+Tab removes a leading indent if one exists.
// When inside a list item, Tab/Shift+Tab still does native list indent/outdent.
const INDENT = '\u00a0\u00a0\u00a0\u00a0' // 4 non-breaking spaces

const TabIndent = Extension.create({
  name: 'tabIndent',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // Inside a list — let StarterKit handle it natively
        if (editor.isActive('listItem')) return false

        // Insert indent at cursor position
        return editor
          .chain()
          .focus()
          .insertContent(INDENT)
          .run()
      },
      'Shift-Tab': ({ editor }) => {
        // Inside a list — let StarterKit handle outdent natively
        if (editor.isActive('listItem')) return false

        // Remove a leading indent from the start of the current paragraph
        const { state, dispatch } = editor.view
        const { selection, doc } = state
        const { $from } = selection
        const start = $from.start()
        const nodeText = $from.parent.textContent

        if (nodeText.startsWith(INDENT)) {
          const from = start
          const to = start + INDENT.length
          dispatch(state.tr.delete(from, to))
          return true
        }

        return false
      },
    }
  },
})

// ─── Toolbar helpers ──────────────────────────────────────────────────────────
function ToolbarButton({ onClick, isActive, title, children, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`
        p-1.5 rounded transition-all duration-150 text-sm
        ${isActive
          ? 'bg-amber text-slate-900'
          : 'text-slate-400 hover:text-cream hover:bg-slate-700'
        }
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-slate-600 mx-1" />
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Begin writing your story…',
  className = '',
  variant = 'editor', // editor | notes
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      TabIndent,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
  })

  if (!editor) return null

  const isNotes = variant === 'notes'

  // Toolbar indent/outdent via button (mirrors Tab / Shift-Tab)
  const insertIndent = () => editor.chain().focus().insertContent(INDENT).run()
  const removeIndent = () => {
    const { state, dispatch } = editor.view
    const { selection } = state
    const { $from } = selection
    const start = $from.start()
    const nodeText = $from.parent.textContent
    if (nodeText.startsWith(INDENT)) {
      dispatch(state.tr.delete(start, start + INDENT.length))
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className={`
        flex flex-wrap items-center gap-0.5 p-2 border-b bg-slate-800
        ${isNotes ? 'border-slate-600' : 'border-slate-700 sticky top-0 z-10'}
      `}>
        {/* History */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo" disabled={!editor.can().undo()}>
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo" disabled={!editor.can().redo()}>
          <Redo size={14} />
        </ToolbarButton>

        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')} title="Bold">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')} title="Italic">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')} title="Highlight">
          <Highlighter size={14} />
        </ToolbarButton>

        {!isNotes && (
          <>
            <Divider />
            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
              <Heading1 size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
              <Heading2 size={14} />
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })} title="Align left">
              <AlignLeft size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })} title="Center">
              <AlignCenter size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })} title="Align right">
              <AlignRight size={14} />
            </ToolbarButton>
          </>
        )}

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={14} />
        </ToolbarButton>

        {!isNotes && (
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider">
            <Minus size={14} />
          </ToolbarButton>
        )}

        <Divider />

        {/* Indent / Outdent */}
        <ToolbarButton onClick={insertIndent} title="Indent paragraph (Tab)">
          <IndentIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={removeIndent} title="Remove indent (Shift+Tab)">
          {/* Flip the icon horizontally for "outdent" */}
          <IndentIcon size={14} style={{ transform: 'scaleX(-1)' }} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <div className={`flex-1 overflow-y-auto ${isNotes ? 'tiptap-notes' : 'tiptap-editor'}`}>
        <div className="p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
