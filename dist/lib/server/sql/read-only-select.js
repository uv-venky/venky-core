import { Parser } from 'node-sql-parser';
const sqlParser = new Parser();
export function stripSqlComments(sql) {
    let out = '';
    let i = 0;
    while (i < sql.length) {
        const c = sql[i];
        const n = sql[i + 1];
        if (c === '-' && n === '-') {
            const end = sql.indexOf('\n', i);
            i = end === -1 ? sql.length : end + 1;
            out += ' ';
            continue;
        }
        if (c === '/' && n === '*') {
            const end = sql.indexOf('*/', i + 2);
            i = end === -1 ? sql.length : end + 2;
            out += ' ';
            continue;
        }
        if (c === '$') {
            const tagMatch = sql.slice(i).match(/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/);
            if (tagMatch) {
                const tag = tagMatch[0];
                const end = sql.indexOf(tag, i + tag.length);
                const stop = end === -1 ? sql.length : end + tag.length;
                out += sql.slice(i, stop);
                i = stop;
                continue;
            }
        }
        if ((c === 'E' || c === 'e') && n === "'") {
            const prev = i > 0 ? sql[i - 1] : '';
            if (!prev || !/[A-Za-z0-9_]/.test(prev)) {
                out += c;
                out += "'";
                i += 2;
                while (i < sql.length) {
                    const ch = sql[i];
                    if (ch === '\\' && i + 1 < sql.length) {
                        out += ch;
                        out += sql[i + 1];
                        i += 2;
                        continue;
                    }
                    out += ch;
                    i++;
                    if (ch === "'") {
                        if (sql[i] === "'") {
                            out += "'";
                            i++;
                            continue;
                        }
                        break;
                    }
                }
                continue;
            }
        }
        if (c === "'") {
            out += c;
            i++;
            while (i < sql.length) {
                const ch = sql[i];
                out += ch;
                i++;
                if (ch === "'") {
                    if (sql[i] === "'") {
                        out += "'";
                        i++;
                        continue;
                    }
                    break;
                }
            }
            continue;
        }
        out += c;
        i++;
    }
    return out;
}
const DENIED_FUNCTIONS = new Set([
    'pg_sleep',
    'pg_sleep_for',
    'pg_sleep_until',
    'pg_read_file',
    'pg_read_binary_file',
    'pg_ls_dir',
    'pg_stat_file',
    'lo_import',
    'lo_export',
    'pg_terminate_backend',
    'pg_cancel_backend',
    'pg_advisory_lock',
    'pg_advisory_unlock',
    'pg_advisory_xact_lock',
    'pg_advisory_lock_shared',
    'pg_advisory_unlock_shared',
    'pg_advisory_unlock_all',
    'pg_try_advisory_lock',
    'pg_try_advisory_xact_lock',
    'pg_execute_server_program',
    'dblink',
    'dblink_exec',
    'dblink_open',
    'dblink_send_query',
    'dblink_connect',
    'dblink_disconnect',
    'set_config',
    'pg_reload_conf',
    'pg_rotate_logfile',
    'pg_promote',
]);
function assertNoDeniedFunctions(node) {
    if (!node || typeof node !== 'object')
        return;
    if (Array.isArray(node)) {
        for (const child of node)
            assertNoDeniedFunctions(child);
        return;
    }
    const obj = node;
    if (obj.type === 'function' || obj.type === 'aggr_func') {
        const rawName = obj.name;
        let fnName;
        if (typeof rawName === 'string') {
            fnName = rawName;
        }
        else if (rawName && typeof rawName === 'object') {
            const inner = rawName.name;
            if (typeof inner === 'string') {
                fnName = inner;
            }
            else if (Array.isArray(inner)) {
                const last = inner[inner.length - 1];
                if (last && typeof last.value === 'string')
                    fnName = last.value;
            }
        }
        if (fnName && DENIED_FUNCTIONS.has(fnName.toLowerCase())) {
            throw new Error(`Invalid query! Function "${fnName}" is not allowed.`);
        }
    }
    for (const key of Object.keys(obj)) {
        assertNoDeniedFunctions(obj[key]);
    }
}
export function assertReadOnlySelect(sql) {
    const cleaned = stripSqlComments(sql).trim();
    if (!cleaned) {
        throw new Error('Invalid query! Empty SQL after comment stripping.');
    }
    let ast;
    try {
        ast = sqlParser.astify(cleaned, { database: 'postgresql' });
    }
    catch (err) {
        const e = err;
        const loc = e.location?.start;
        const where = loc?.line ? ` at line ${loc.line}, column ${loc.column}` : '';
        const found = e.message?.match(/but\s+([^.]+?)\s+found/i)?.[1];
        const detail = found ? `unexpected ${found}` : 'syntax error';
        throw new Error(`Invalid query! SQL ${detail}${where}.`);
    }
    const statements = Array.isArray(ast) ? ast : [ast];
    if (statements.length !== 1) {
        throw new Error('Invalid query! Only a single statement is allowed.');
    }
    const stmt = statements[0];
    if (stmt?.type !== 'select') {
        throw new Error(`Invalid query! Only SELECT (with optional CTEs) is allowed; got ${stmt?.type}.`);
    }
    assertNoDeniedFunctions(stmt);
}
export function getPgTypeName(field) {
    const typeMap = {
        16: 'boolean',
        20: 'bigint',
        21: 'smallint',
        23: 'integer',
        25: 'text',
        604: 'polygon',
        700: 'real',
        701: 'double precision',
        1042: 'character',
        1043: 'character varying',
        1082: 'date',
        1083: 'time without time zone',
        1114: 'timestamp without time zone',
        1184: 'timestamp with time zone',
        1266: 'time with time zone',
        1700: 'numeric',
        2950: 'uuid',
        3802: 'jsonb',
    };
    return typeMap[field.dataTypeID] || 'text';
}
//# sourceMappingURL=read-only-select.js.map