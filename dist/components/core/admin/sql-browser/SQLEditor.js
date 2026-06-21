'use client';
import { jsx as _jsx } from "react/jsx-runtime";
// Import monaco-setup to configure the loader to use local monaco-editor package
import '../../../../lib/monaco-setup';
import Editor from '@monaco-editor/react';
import { useRef } from 'react';
import useAutoSizer from '../../../../components/core/hooks/useAutoSizer';
import useTheme from '../../../../components/core/hooks/useTheme';
export default function SQLEditor({ value, onChange, handleEditorDidMount }) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const onEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        // Configure SQL language (only if languages API is available)
        if (!monaco.languages)
            return;
        monaco.languages.register({ id: 'sql' });
        // PostgreSQL keywords for better completion
        const sqlKeywords = [
            // DML
            'SELECT',
            'FROM',
            'WHERE',
            'AND',
            'OR',
            'NOT',
            'ORDER',
            'BY',
            'GROUP',
            'HAVING',
            'LIMIT',
            'OFFSET',
            'JOIN',
            'LEFT',
            'RIGHT',
            'INNER',
            'OUTER',
            'FULL',
            'CROSS',
            'NATURAL',
            'ON',
            'USING',
            'AS',
            'DISTINCT',
            'ALL',
            'UNION',
            'INTERSECT',
            'EXCEPT',
            'CASE',
            'WHEN',
            'THEN',
            'ELSE',
            'END',
            'IN',
            'BETWEEN',
            'LIKE',
            'ILIKE',
            'SIMILAR',
            'IS',
            'ISNULL',
            'NOTNULL',
            'NULL',
            'TRUE',
            'FALSE',
            'ASC',
            'DESC',
            'NULLS',
            'FIRST',
            'LAST',
            'FETCH',
            'NEXT',
            'ROWS',
            'ONLY',
            'WITH',
            'RECURSIVE',
            'RETURNING',
            // DDL
            'CREATE',
            'DROP',
            'INSERT',
            'INTO',
            'VALUES',
            'UPDATE',
            'SET',
            'DELETE',
            'ALTER',
            'TABLE',
            'VIEW',
            'INDEX',
            'SCHEMA',
            'DATABASE',
            'SEQUENCE',
            'FUNCTION',
            'PROCEDURE',
            'TRIGGER',
            'TYPE',
            'EXTENSION',
            'PRIMARY',
            'KEY',
            'FOREIGN',
            'REFERENCES',
            'CONSTRAINT',
            'UNIQUE',
            'CHECK',
            'DEFAULT',
            'CASCADE',
            'RESTRICT',
            'IF',
            'EXISTS',
            // PostgreSQL specific
            'SERIAL',
            'BIGSERIAL',
            'SMALLSERIAL',
            'RETURNING',
            'UPSERT',
            'CONFLICT',
            'DO',
            'NOTHING',
            'EXCLUDED',
            'LATERAL',
            'OVER',
            'PARTITION',
            'WINDOW',
            'FILTER',
            'WITHIN',
            'ORDINALITY',
        ];
        // PostgreSQL aggregate and common functions
        const sqlFunctions = [
            // Aggregate functions
            'COUNT',
            'SUM',
            'AVG',
            'MAX',
            'MIN',
            'ARRAY_AGG',
            'STRING_AGG',
            'JSON_AGG',
            'JSONB_AGG',
            'BOOL_AND',
            'BOOL_OR',
            // Window functions
            'ROW_NUMBER',
            'RANK',
            'DENSE_RANK',
            'NTILE',
            'LAG',
            'LEAD',
            'FIRST_VALUE',
            'LAST_VALUE',
            'NTH_VALUE',
            // String functions
            'CONCAT',
            'LENGTH',
            'LOWER',
            'UPPER',
            'TRIM',
            'LTRIM',
            'RTRIM',
            'SUBSTRING',
            'REPLACE',
            'SPLIT_PART',
            'REGEXP_REPLACE',
            'REGEXP_MATCHES',
            'LEFT',
            'RIGHT',
            // Date/time functions
            'NOW',
            'CURRENT_DATE',
            'CURRENT_TIME',
            'CURRENT_TIMESTAMP',
            'DATE_TRUNC',
            'DATE_PART',
            'EXTRACT',
            'AGE',
            'INTERVAL',
            // JSON functions
            'JSON_BUILD_OBJECT',
            'JSONB_BUILD_OBJECT',
            'JSON_OBJECT',
            'TO_JSON',
            'TO_JSONB',
            'JSON_EXTRACT_PATH',
            'JSONB_EXTRACT_PATH_TEXT',
            // Type conversion
            'CAST',
            'COALESCE',
            'NULLIF',
            'GREATEST',
            'LEAST',
            // Other
            'EXISTS',
            'ANY',
            'SOME',
            'GENERATE_SERIES',
            'UNNEST',
        ];
        // PostgreSQL data types
        const sqlTypes = [
            'INTEGER',
            'INT',
            'BIGINT',
            'SMALLINT',
            'NUMERIC',
            'DECIMAL',
            'REAL',
            'DOUBLE PRECISION',
            'FLOAT',
            'VARCHAR',
            'CHAR',
            'TEXT',
            'BOOLEAN',
            'BOOL',
            'DATE',
            'TIME',
            'TIMESTAMP',
            'TIMESTAMPTZ',
            'INTERVAL',
            'UUID',
            'JSON',
            'JSONB',
            'ARRAY',
            'BYTEA',
        ];
        monaco.languages.setMonarchTokensProvider('sql', {
            keywords: sqlKeywords,
            operators: [
                '=',
                '>',
                '<',
                '!',
                '~',
                '?',
                ':',
                '==',
                '<=',
                '>=',
                '!=',
                '<>',
                '::',
                '||',
                '&&',
                '++',
                '--',
                '**',
                '//',
                '/*',
                '*/',
            ],
            symbols: /[=><!~?:&|+\-*/^%]+/,
            tokenizer: {
                root: [
                    [
                        /[a-z_$][\w$]*/,
                        {
                            cases: {
                                '@keywords': 'keyword',
                                '@default': 'identifier',
                            },
                        },
                    ],
                    [/[A-Z][\w$]*/, 'type.identifier'],
                    { include: '@whitespace' },
                    [/[{}()[\]]/, '@brackets'],
                    [/[<>](?!@symbols)/, '@brackets'],
                    [
                        /@symbols/,
                        {
                            cases: {
                                '@operators': 'operator',
                                '@default': '',
                            },
                        },
                    ],
                    [/'/, 'string', '@string'],
                    [/"/, 'string', '@string_double'],
                    [/`/, 'string', '@string_backtick'],
                    [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
                    [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                    [/\d+/, 'number'],
                    [/[,;]/, 'delimiter'],
                    [/--.*$/, 'comment'],
                    [/\/\*/, 'comment', '@comment'],
                ],
                whitespace: [[/\s+/, 'white']],
                comment: [
                    [/[^/*]+/, 'comment'],
                    [/\*\//, 'comment', '@pop'],
                    [/[/*]/, 'comment'],
                ],
                string: [
                    [/[^']+/, 'string'],
                    [/''/, 'string'],
                    [/'/, 'string', '@pop'],
                ],
                string_double: [
                    [/[^"]+/, 'string'],
                    [/""/, 'string'],
                    [/"/, 'string', '@pop'],
                ],
                string_backtick: [
                    [/[^`]+/, 'string'],
                    [/``/, 'string'],
                    [/`/, 'string', '@pop'],
                ],
            },
        });
        // Register completion provider for SQL keywords, functions, and types
        monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };
                const keywordSuggestions = sqlKeywords.map((keyword) => ({
                    label: keyword,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword,
                    range,
                }));
                const functionSuggestions = sqlFunctions.map((func) => ({
                    label: func,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: `${func}($0)`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                }));
                const typeSuggestions = sqlTypes.map((type) => ({
                    label: type,
                    kind: monaco.languages.CompletionItemKind.TypeParameter,
                    insertText: type,
                    range,
                }));
                return {
                    suggestions: [...keywordSuggestions, ...functionSuggestions, ...typeSuggestions],
                };
            },
        });
        handleEditorDidMount(editor, monaco);
    };
    const { height, width, Container } = useAutoSizer();
    const { theme } = useTheme();
    return (_jsx("div", { className: "flex h-full flex-col", children: _jsx(Container, { className: "relative flex-1", children: _jsx(Editor, { height: height, width: width, language: "sql", theme: theme === 'dark' ? 'vs-dark' : 'vs-light', value: value, onChange: (val) => onChange(val || ''), onMount: onEditorDidMount, options: {
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    lineNumbers: 'on',
                    roundedSelection: false,
                    automaticLayout: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    wordBasedSuggestions: 'currentDocument',
                    parameterHints: {
                        enabled: true,
                    },
                    hover: {
                        enabled: true,
                    },
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    insertSpaces: true,
                    detectIndentation: false,
                    trimAutoWhitespace: true,
                    largeFileOptimizations: true,
                    placeholder: 'Ctrl+Enter: Run | Ctrl+Shift+F: Format',
                } }) }) }));
}
//# sourceMappingURL=SQLEditor.js.map