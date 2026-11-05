import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ACTIVATION_VIEW_ABILITY, visibleActivadaAt } from './activation-visibility';

const activadaAt = new Date('2026-11-05T12:33:00.000Z');

describe('visibleActivadaAt', () => {
  it('returns the activation timestamp when the viewer has the permission', () => {
    assert.equal(visibleActivadaAt({ permissions: [ACTIVATION_VIEW_ABILITY] }, activadaAt), '2026-11-05T12:33:00.000Z');
  });

  it('hides the activation timestamp when the viewer lacks the permission', () => {
    assert.equal(visibleActivadaAt({ permissions: ['appointment.attend'] }, activadaAt), null);
  });

  it('returns null when the appointment was never activated', () => {
    assert.equal(visibleActivadaAt({ permissions: [ACTIVATION_VIEW_ABILITY] }, null), null);
  });
});
