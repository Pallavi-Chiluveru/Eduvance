const assert = require('node:assert/strict');
const express = require('express');
const limiter = require('../middleware/apiRateLimit');
(async () => {
    const app = express();
    app.use('/api', limiter);
    app.use((_req, res) => res.json({ success: true }));
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const request = async path => { const r = await fetch(base + path); await r.json(); return r; };
    try {
        for (let i = 0; i < 200; i++) assert.equal((await request('/student/courses')).status, 200);
        assert.equal((await request('/student/courses')).status, 429);
        assert.equal((await request('/auth/csrf-token')).status, 200);
        assert.equal((await request('/auth/register')).status, 200);
        console.log('General quota exhaustion leaves CSRF and registration available: PASS');
        for (let i = 1; i < 60; i++) assert.equal((await request('/auth/csrf-token')).status, 200);
        const limited = await request('/auth/csrf-token');
        assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0);
        assert.equal((await request('/auth/register')).status, 200);
        assert.equal((await request('/auth/login')).status, 200);
        console.log('CSRF has its own enforced quota and does not consume registration quota: PASS');
    } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
