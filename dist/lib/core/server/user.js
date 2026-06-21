'use server';
// Lazy-loaded to break circular dep: auth → relay-state-plugin → user → auth
const _hashPassword = () => import('../../../auth').then((m) => m.hashPassword);
import logger from '../../../lib/core/server/logger';
import { PREFIX } from '../../../lib/server/constants';
import { startOfDay } from 'date-fns';
import { sendNewUserEmail, bulkQueueNewUserEmails } from './email';
import { getConfig } from './config';
export async function createUser(client, createdBy, newUser, sendEmail = false) {
    const now = new Date().toISOString();
    const { password, ...rest } = newUser;
    const user = {
        ...rest,
        userName: rest.userName.toLowerCase().trim(),
        email: rest.email.toLowerCase().trim(),
        createdAt: now,
        createdBy,
        updatedAt: now,
        updatedBy: createdBy,
        startDate: rest.startDate ?? now,
        passwordHash: password === 'SSO' ? 'SSO' : await (await _hashPassword())(password),
        previousPasswordHashes: [],
        failedLoginAttempts: 0,
        forcePasswordChange: rest.forcePasswordChange ?? true,
    };
    try {
        const { rows } = await client.query(`INSERT INTO ${PREFIX}users(
        user_name, user_id, email, display_name, location_name, picture,
        created_at, created_by, updated_at, updated_by, start_date, end_date,
        password_hash, api_key, api_secret, previous_password_hashes, locked,
        failed_login_attempts, settings,force_password_change)
        VALUES ($1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20)
        RETURNING user_name`, [
            user.userName,
            user.userId,
            user.email,
            user.displayName,
            user.locationName,
            user.picture,
            user.createdAt,
            user.createdBy,
            user.updatedAt,
            user.updatedBy,
            user.startDate,
            user.endDate,
            user.passwordHash,
            user.apiKey,
            user.apiSecret,
            JSON.stringify([]),
            user.locked ?? false,
            user.failedLoginAttempts ?? 0,
            user.settings ?? {},
            user.forcePasswordChange ?? true,
        ]);
        if (sendEmail && password !== 'SSO' && password !== 'test') {
            await sendNewUserEmail({
                client,
                email: user.email,
                userName: user.userName,
                password: password,
                isInternal: false,
            });
        }
        return rows[0]?.user_name;
    }
    catch (e) {
        logger.error('error in createUser', e);
        throw e;
    }
}
export async function bulkCreateUsers(client, createdBy, newUsers, options) {
    if (newUsers.length === 0)
        return [];
    const now = new Date().toISOString();
    const valueClauses = [];
    const params = [];
    const emailUsers = [];
    let i = 1;
    for (const newUser of newUsers) {
        const { password, sendEmail: shouldSendEmail, ...rest } = newUser;
        const userName = rest.userName.toLowerCase().trim();
        const email = rest.email.toLowerCase().trim();
        const passwordHash = password === 'SSO' ? 'SSO' : await (await _hashPassword())(password);
        valueClauses.push(`($${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6}, $${i + 7}, $${i + 8}, $${i + 9}, $${i + 10}, $${i + 11}, $${i + 12}, $${i + 13}, $${i + 14}, $${i + 15}, $${i + 16}, $${i + 17}, $${i + 18}, $${i + 19})`);
        params.push(userName, rest.userId, email, rest.displayName, rest.locationName, rest.picture, now, createdBy, now, createdBy, rest.startDate ?? now, rest.endDate, passwordHash, rest.apiKey, rest.apiSecret, JSON.stringify([]), rest.locked ?? false, 0, rest.settings ?? {}, rest.forcePasswordChange ?? true);
        i += 20;
        if (shouldSendEmail && password !== 'SSO' && password !== 'test') {
            emailUsers.push({ email, userName, password });
        }
    }
    try {
        const { rows } = await client.query(`INSERT INTO ${PREFIX}users(
        user_name, user_id, email, display_name, location_name, picture,
        created_at, created_by, updated_at, updated_by, start_date, end_date,
        password_hash, api_key, api_secret, previous_password_hashes, locked,
        failed_login_attempts, settings, force_password_change)
        VALUES ${valueClauses.join(', ')}
        RETURNING user_name`, params);
        if (emailUsers.length > 0) {
            await bulkQueueNewUserEmails({ users: emailUsers, isInternal: options?.isInternal ?? false, client });
        }
        return rows.map((r) => r.user_name);
    }
    catch (e) {
        logger.error('error in bulkCreateUsers', e);
        throw e;
    }
}
export async function bulkAssignRolesToUsers(client, data) {
    const { assignments, createdBy } = data;
    if (assignments.length === 0)
        return;
    const now = startOfDay(new Date()).toISOString();
    const appId = getConfig('assignRolesToUser').appId;
    const valueClauses = [];
    const params = [];
    let i = 1;
    for (const { userName, roles, startDate = now, endDate } of assignments) {
        for (const role of roles) {
            valueClauses.push(`($${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6}, $${i + 7}, $${i + 8})`);
            params.push(userName, role, now, createdBy, now, createdBy, startDate, endDate, appId);
            i += 9;
        }
    }
    if (valueClauses.length === 0)
        return;
    const sql = `INSERT INTO ${PREFIX}user_roles(user_name, role_code, created_at, created_by, updated_at, updated_by, start_date, end_date, app_id)
    VALUES ${valueClauses.join(',')}
    ON CONFLICT (user_name, role_code) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by`;
    try {
        await client.query(sql, params);
    }
    catch (e) {
        logger.error('error in bulkAssignRolesToUsers', e);
        throw e;
    }
}
export async function endDateUser(client, data) {
    const now = new Date().toISOString();
    const { userName, endDate = now, updatedBy } = data;
    try {
        await client.query(`UPDATE ${PREFIX}users SET end_date = $1, updated_at = $2, updated_by = $3 WHERE user_name = $4`, [endDate, now, updatedBy, userName]);
    }
    catch (e) {
        logger.error('error in endDateUser', e);
        throw e;
    }
}
export async function reactivateUser(client, data) {
    const now = new Date().toISOString();
    const { userName, updatedBy } = data;
    try {
        await client.query(`UPDATE ${PREFIX}users SET end_date = NULL, updated_at = $1, updated_by = $2 WHERE user_name = $3`, [now, updatedBy, userName]);
    }
    catch (e) {
        logger.error('error in reactivateUser', e);
        throw e;
    }
}
export async function assignRolesToUser(client, data) {
    const now = startOfDay(new Date()).toISOString();
    const appId = getConfig('assignRolesToUser').appId;
    const { roles, userName, startDate = now, endDate, createdBy } = data;
    const sql = [
        `INSERT INTO ${PREFIX}user_roles(user_name, role_code, created_at, created_by, updated_at, updated_by, start_date, end_date, app_id)
      VALUES `,
    ];
    const params = [];
    let i = 1;
    const valueClauses = [];
    for (const role of roles) {
        valueClauses.push(`($${i}, $${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6}, $${i + 7}, $${i + 8})`);
        params.push(userName, role, now, createdBy, now, createdBy, startDate, endDate, appId);
        i += 9;
    }
    sql.push(valueClauses.join(','));
    sql.push(` ON CONFLICT (user_name, role_code) DO UPDATE SET start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, updated_at = EXCLUDED.updated_at, updated_by = EXCLUDED.updated_by`);
    try {
        await client.query(sql.join(''), params);
    }
    catch (e) {
        logger.error('error in assignRolesToUser', e);
        throw e;
    }
}
export async function endDateRolesToUser(client, data) {
    if (!data.roles.length) {
        return;
    }
    const now = new Date().toISOString();
    const { roles, userName, endDate = now, updatedBy } = data;
    const placeholders = roles.map((_, index) => `$${index + 5}`).join(',');
    try {
        await client.query(`UPDATE ${PREFIX}user_roles SET end_date = $1, updated_at = $2, updated_by = $3 WHERE user_name = $4 AND role_code IN (${placeholders})`, [endDate, now, updatedBy, userName, ...roles]);
    }
    catch (e) {
        logger.error('error in endDateRolesToUser', e);
        throw e;
    }
}
export async function syncUserRoles(client, data) {
    const appId = getConfig('syncUserRoles').appId;
    const now = new Date();
    const { roles, userName, createdBy, updatedBy, startDate = now } = data;
    const { rows } = await client.query(`SELECT role_code, end_date FROM ${PREFIX}user_roles WHERE user_name = $1 AND app_id = $2`, [userName, appId]);
    const existing = new Map(rows.map((r) => [r.role_code, r.end_date]));
    const toInsert = [];
    const toReactivate = [];
    for (const role of roles) {
        if (!existing.has(role)) {
            toInsert.push(role);
        }
        else if (existing.get(role) !== null) {
            toReactivate.push(role);
        }
    }
    if (toInsert.length) {
        await assignRolesToUser(client, {
            createdBy,
            roles: toInsert,
            userName,
            startDate,
        });
    }
    if (toReactivate.length) {
        await assignRolesToUser(client, {
            createdBy: updatedBy,
            roles: toReactivate,
            userName,
            startDate,
        });
    }
    const toEndDate = Array.from(existing.entries())
        .filter(([role, end]) => end === null && !roles.includes(role))
        .map(([role]) => role);
    if (toEndDate.length) {
        await endDateRolesToUser(client, {
            updatedBy,
            roles: toEndDate,
            userName,
            endDate: now,
        });
    }
}
//# sourceMappingURL=user.js.map