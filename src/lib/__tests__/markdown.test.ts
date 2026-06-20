import { describe, expect, it } from 'vitest';
import { MARKDOWN_RE, hasMarkdownSyntax } from '../markdown';

describe('MARKDOWN_RE', () => {
  // ---- Headings ----
  describe('headings', () => {
    it.each(['# H1', '## H2', '### H3', '#### H4', '##### H5', '###### H6'])('matches heading: %s', (input) =>
      expect(MARKDOWN_RE.test(input)).toBe(true));

    it('matches heading after newline', () => {
      expect(MARKDOWN_RE.test('text\n## Heading')).toBe(true);
    });

    it('rejects # without trailing space', () => {
      expect(MARKDOWN_RE.test('#hashtag')).toBe(false);
    });

    it('rejects ####### (7 hashes)', () => {
      expect(MARKDOWN_RE.test('####### not a heading')).toBe(false);
    });
  });

  // ---- List items ----
  describe('list items', () => {
    it.each(['- item', '* item', '+ item'])('matches unordered list: %s', (input) =>
      expect(MARKDOWN_RE.test(input)).toBe(true));

    it.each(['1. item', '42. item'])('matches ordered list: %s', (input) => expect(MARKDOWN_RE.test(input)).toBe(true));

    it('rejects dash without trailing space', () => {
      expect(MARKDOWN_RE.test('-no-space')).toBe(false);
    });
  });

  // ---- Blockquotes ----
  describe('blockquotes', () => {
    it('matches blockquote', () => {
      expect(MARKDOWN_RE.test('> quoted text')).toBe(true);
    });

    it('matches blockquote after newline', () => {
      expect(MARKDOWN_RE.test('text\n> quoted')).toBe(true);
    });
  });

  // ---- Fenced code blocks ----
  describe('fenced code blocks', () => {
    it('matches triple backticks', () => {
      expect(MARKDOWN_RE.test('```js\nconsole.log(1)\n```')).toBe(true);
    });

    it('matches bare triple backticks', () => {
      expect(MARKDOWN_RE.test('```')).toBe(true);
    });
  });

  // ---- Inline code ----
  describe('inline code', () => {
    it('matches inline code', () => {
      expect(MARKDOWN_RE.test('use `npm install`')).toBe(true);
    });

    it('rejects lone backtick', () => {
      expect(MARKDOWN_RE.test('a ` b')).toBe(false);
    });
  });

  // ---- Links ----
  describe('links', () => {
    it('matches markdown link', () => {
      expect(MARKDOWN_RE.test('[text](https://example.com)')).toBe(true);
    });

    it('matches link in surrounding text', () => {
      expect(MARKDOWN_RE.test('See [docs](http://example.com) for info')).toBe(true);
    });
  });

  // ---- Pipe tables ----
  describe('pipe tables', () => {
    it('matches table separator row', () => {
      expect(MARKDOWN_RE.test('|---|---|')).toBe(true);
    });

    it('matches separator with alignment', () => {
      expect(MARKDOWN_RE.test('| :---: | ---: |')).toBe(true);
    });

    it('matches separator with spaces', () => {
      expect(MARKDOWN_RE.test('| --- | --- |')).toBe(true);
    });

    it('matches full table', () => {
      const table = '| A | B |\n|---|---|\n| 1 | 2 |';
      expect(MARKDOWN_RE.test(table)).toBe(true);
    });

    it('rejects single pipe', () => {
      expect(MARKDOWN_RE.test('value | other')).toBe(false);
    });
  });

  // ---- Bold ----
  describe('bold', () => {
    it('matches bold text', () => {
      expect(MARKDOWN_RE.test('**bold**')).toBe(true);
    });

    it('matches bold in surrounding text', () => {
      expect(MARKDOWN_RE.test('This is **important** info')).toBe(true);
    });

    it('rejects unclosed bold', () => {
      expect(MARKDOWN_RE.test('** not closed')).toBe(false);
    });

    it('treats **** as horizontal rule (not empty bold)', () => {
      // **** matches the HR pattern (4+ identical chars), which is correct
      expect(MARKDOWN_RE.test('****')).toBe(true);
    });
  });

  // ---- Strikethrough ----
  describe('strikethrough', () => {
    it('matches strikethrough', () => {
      expect(MARKDOWN_RE.test('~~deleted~~')).toBe(true);
    });

    it('matches strikethrough in text', () => {
      expect(MARKDOWN_RE.test('This is ~~old~~ new')).toBe(true);
    });

    it('rejects unclosed strikethrough', () => {
      expect(MARKDOWN_RE.test('~~ not closed')).toBe(false);
    });

    it('rejects empty strikethrough', () => {
      expect(MARKDOWN_RE.test('~~~~')).toBe(false);
    });
  });

  // ---- Horizontal rules ----
  describe('horizontal rules', () => {
    it.each(['---', '***', '___'])('matches horizontal rule: %s', (input) =>
      expect(MARKDOWN_RE.test(input)).toBe(true));

    it.each(['-----', '*****', '_____'])('matches long horizontal rule: %s', (input) =>
      expect(MARKDOWN_RE.test(input)).toBe(true));

    it('matches horizontal rule after newline', () => {
      expect(MARKDOWN_RE.test('text\n---\nmore')).toBe(true);
    });

    it('matches with leading spaces (up to 3)', () => {
      expect(MARKDOWN_RE.test('   ---')).toBe(true);
    });

    it('rejects mixed characters', () => {
      expect(MARKDOWN_RE.test('-*_')).toBe(false);
    });

    it('rejects double dash', () => {
      expect(MARKDOWN_RE.test('--')).toBe(false);
    });
  });

  // ---- Plain text (should NOT match) ----
  describe('plain text (no false positives)', () => {
    it.each([
      'Hello world',
      'This is a normal sentence.',
      'well-known fact',
      'a * b = c',
      'price: $100',
      'email@example.com',
      '2025-01-31',
      'foo_bar_baz',
      'A | B',
    ])('rejects plain text: %s', (input) => expect(MARKDOWN_RE.test(input)).toBe(false));
  });
});

describe('hasMarkdownSyntax', () => {
  it('returns true for markdown content', () => {
    expect(hasMarkdownSyntax('# Title\n\nSome text with **bold**')).toBe(true);
  });

  it('returns false for plain text', () => {
    expect(hasMarkdownSyntax('Just plain text without any markdown')).toBe(false);
  });

  it('detects table-only content', () => {
    const table = `| Start Date | End Date | Customer |
|------------|----------|----------|
| 2026-01-04 | 2026-01-10 | Lowe's |`;
    expect(hasMarkdownSyntax(table)).toBe(true);
  });

  it('detects bold-only content', () => {
    expect(hasMarkdownSyntax('The result is **100.00**')).toBe(true);
  });
});
