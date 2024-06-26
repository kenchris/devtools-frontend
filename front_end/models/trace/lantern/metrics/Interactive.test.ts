// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Lantern from '../lantern.js';
import {getComputationDataFromFixture, loadTrace} from '../testing/MetricTestUtils.js';

const {Interactive, FirstContentfulPaint, LargestContentfulPaint} = Lantern.Metrics;

describe('Metrics: Lantern TTI', () => {
  let trace: Lantern.Trace;
  let iframeTrace: Lantern.Trace;
  before(async function() {
    trace = await loadTrace(this, 'lantern/progressive-app/trace.json.gz');
    iframeTrace = await loadTrace(this, 'lantern/iframe/trace.json.gz');
  });

  it('should compute predicted value', async () => {
    const data = await getComputationDataFromFixture({trace});
    const result = await Interactive.compute(data, {
      lcpResult: await LargestContentfulPaint.compute(data, {
        fcpResult: await FirstContentfulPaint.compute(data),
      }),
    });

    assert.deepStrictEqual(
        {
          timing: Math.round(result.timing),
          optimistic: Math.round(result.optimisticEstimate.timeInMs),
          pessimistic: Math.round(result.pessimisticEstimate.timeInMs),
        },
        {
          optimistic: 1107,
          pessimistic: 1134,
          timing: 1122,
        });
    assert.strictEqual(result.optimisticEstimate.nodeTimings.size, 14);
    assert.strictEqual(result.pessimisticEstimate.nodeTimings.size, 31);
    assert.ok(result.optimisticGraph, 'should have created optimistic graph');
    assert.ok(result.pessimisticGraph, 'should have created pessimistic graph');
  });

  it('should compute predicted value on iframes with substantial layout', async () => {
    const data = await getComputationDataFromFixture({
      trace: iframeTrace,
    });
    const result = await Interactive.compute(data, {
      lcpResult: await LargestContentfulPaint.compute(data, {
        fcpResult: await FirstContentfulPaint.compute(data),
      }),
    });

    assert.deepStrictEqual(
        {
          timing: Math.round(result.timing),
          optimistic: Math.round(result.optimisticEstimate.timeInMs),
          pessimistic: Math.round(result.pessimisticEstimate.timeInMs),
        },
        {
          optimistic: 2372,
          pessimistic: 2386,
          timing: 2379,
        });
    assert.ok(result.optimisticGraph, 'should have created optimistic graph');
    assert.ok(result.pessimisticGraph, 'should have created pessimistic graph');
  });
});
