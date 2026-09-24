const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
const LIMIT = 3;
function reapplicationState(v = {}, now = new Date()) {
    const time = +now;
    const available = v.reapplyAvailableAt ? +new Date(v.reapplyAvailableAt) : 0;
    const start = v.rejectionWindowStartedAt ? +new Date(v.rejectionWindowStartedAt) : 0;
    const locked = v.status !== 'approved' && (v.rejectionCount || 0) >= LIMIT && available > time;
    const reset = !locked && ((available > 0 && time >= available) || (start > 0 && time >= start + PERIOD_MS));
    return { locked, rejectionCount: reset ? 0 : (v.rejectionCount || 0), limit: LIMIT, reapplyAvailableAt: available ? new Date(available) : null, reset, eligibleAgain: reset && (v.rejectionCount || 0) > 0 };
}
function rejectionUpdate(v, reviewer, reason, now = new Date()) {
    const state = reapplicationState(v, now);
    const count = state.rejectionCount + 1;
    return {
        rejectionCount: count,
        rejectionWindowStartedAt: state.reset || !v.rejectionWindowStartedAt ? now : v.rejectionWindowStartedAt,
        lastRejectedAt: now,
        reapplyAvailableAt: count >= LIMIT ? new Date(+now + PERIOD_MS) : null,
        event: { rejectedAt: now, rejectedBy: reviewer, reason },
    };
}
function denyCooldown(res, state) {
    return res.status(403).json({ success: false, code: 'REAPPLICATION_COOLDOWN', reapplyAvailableAt: state.reapplyAvailableAt, message: `You have reached the maximum number of verification attempts. You can reapply after ${state.reapplyAvailableAt.toISOString()}.` });
}
module.exports = { PERIOD_MS, LIMIT, reapplicationState, rejectionUpdate, denyCooldown };
