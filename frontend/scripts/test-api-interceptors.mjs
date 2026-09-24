import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { AxiosError } from 'axios';

// Exercise the real interceptors through Axios's adapter, without a live server.
const source = (await readFile(new URL('../src/services/api.js', import.meta.url), 'utf8'))
    .replace("'axios'", JSON.stringify(new URL('../node_modules/axios/index.js', import.meta.url).href))
    .replace('import.meta.env.VITE_API_URL', "'/api'");
let instance = 0;
async function client(handler) {
    globalThis.localStorage = { getItem: () => 'expired-token', setItem() {}, removeItem() {} };
    globalThis.window = { location: { pathname: '/student', href: '', replace() {} } };
    const { default: api } = await import(`data:text/javascript;base64,${Buffer.from(source + `\n// instance ${instance++}`).toString('base64')}`);
    api.defaults.adapter = async config => {
        const result = await handler(config);
        const response = { data: result.data || {}, status: result.status || 200, headers: result.headers || {}, config };
        if (response.status >= 400) throw new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
        return response;
    };
    return api;
}
const token = { data: { data: { csrfToken: 'test-csrf' } } };
{
    let csrf = 0, mutations = 0;
    const api = await client(async c => {
        if (c.url === '/auth/csrf-token') { csrf++; await new Promise(r => setTimeout(r, 10)); return token; }
        assert.equal(c.headers['X-CSRF-Token'], 'test-csrf'); mutations++; return {};
    });
    await Promise.all([api.post('/one'), api.post('/two')]);
    assert.equal(csrf, 1); assert.equal(mutations, 2);
    console.log('Concurrent mutations share CSRF retrieval: PASS');
}
{
    let mutations = 0;
    const api = await client(c => {
        if (c.url === '/auth/csrf-token') return { status: 429, headers: { 'retry-after': '60' }, data: { message: 'Limited' } };
        mutations++; return {};
    });
    await assert.rejects(api.post('/auth/register'), e => e.response.status === 429 && e.response.data.message.includes('60 seconds'));
    assert.equal(mutations, 0);
    console.log('CSRF failure stops registration and preserves retry delay: PASS');
}
{
    let refreshes = 0;
    const api = await client(async c => {
        if (c.url === '/auth/csrf-token') return token;
        if (c.url === '/auth/refresh') { refreshes++; await new Promise(r => setTimeout(r, 10)); }
        return { status: 401 };
    });
    const results = await Promise.allSettled([api.get('/auth/me'), api.get('/student/courses')]);
    assert.ok(results.every(r => r.status === 'rejected')); assert.equal(refreshes, 1);
    console.log('Concurrent expired sessions refresh once; failed refresh stops: PASS');
}
{
    let refreshes = 0;
    const api = await client(c => {
        if (c.url === '/auth/csrf-token') return token;
        if (c.url === '/auth/refresh') refreshes++;
        return { status: 401 };
    });
    await assert.rejects(api.post('/auth/login'));
    assert.equal(refreshes, 0);
    console.log('Invalid login does not refresh: PASS');
}
{
    let refreshes = 0;
    const api = await client(c => {
        if (c.url === '/auth/csrf-token') return token;
        if (c.url === '/auth/refresh') { refreshes++; return { data: { data: { accessToken: 'fresh-token' } } }; }
        return c._retry ? { data: { ok: true } } : { status: 401 };
    });
    assert.equal((await api.get('/auth/me')).data.ok, true); assert.equal(refreshes, 1);
    console.log('Successful refresh retries original request: PASS');
}
