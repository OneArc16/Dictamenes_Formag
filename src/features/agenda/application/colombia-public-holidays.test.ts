import assert from 'node:assert/strict';
import test from 'node:test';

import { getColombiaPublicHolidays } from './colombia-public-holidays';

test('identifica únicamente festivos públicos de Colombia solicitados', () => {
  const holidays = getColombiaPublicHolidays([
    '2026-08-06',
    '2026-08-07',
    '2026-08-08',
  ]);

  assert.equal(holidays.has('2026-08-06'), false);
  assert.match(holidays.get('2026-08-07') ?? '', /Boyacá/i);
  assert.equal(holidays.has('2026-08-08'), false);
});
