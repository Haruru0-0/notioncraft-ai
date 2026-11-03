import { Mark, mergeAttributes } from '@tiptap/core';

/**
 * Text the assistant wrote. It stays marked (rubine) until the user accepts it or rejects it.
 * `original` holds the text it replaced, so rejecting can put it back. It is saved with the page,
 * so an unresolved suggestion is still there after a reload.
 */
export const AiSuggestion = Mark.create({
  name: 'aiSuggestion',
  inclusive: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-ai-id'),
        renderHTML: (attrs) => (attrs.id ? { 'data-ai-id': attrs.id } : {}),
      },
      original: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-ai-original') ?? '',
        renderHTML: (attrs) => ({ 'data-ai-original': attrs.original ?? '' }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-ai-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'ai-suggestion' }, HTMLAttributes), 0];
  },
});
