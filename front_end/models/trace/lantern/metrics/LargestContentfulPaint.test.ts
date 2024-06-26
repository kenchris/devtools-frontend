// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Lantern from '../lantern.js';
import {getComputationDataFromFixture, loadTrace} from '../testing/MetricTestUtils.js';

const {FirstContentfulPaint, LargestContentfulPaint} = Lantern.Metrics;

describe('Metrics: Lantern LCP', () => {
  let trace: Lantern.Trace;
  before(async function() {
    trace = await loadTrace(this, 'lantern/paul/trace.json.gz');
  });

  it('should compute predicted value', async () => {
    const data = await getComputationDataFromFixture({trace});
    const result = await LargestContentfulPaint.compute(data, {
      fcpResult: await FirstContentfulPaint.compute(data),
    });

    assert.deepStrictEqual(
        {
          timing: Math.round(result.timing),
          optimistic: Math.round(result.optimisticEstimate.timeInMs),
          pessimistic: Math.round(result.pessimisticEstimate.timeInMs),
          optimisticNodeTimings: result.optimisticEstimate.nodeTimings.size,
          pessimisticNodeTimings: result.pessimisticEstimate.nodeTimings.size,
        },
        {
          timing: 1536,
          optimistic: 1457,
          pessimistic: 1616,
          optimisticNodeTimings: 8,
          pessimisticNodeTimings: 9,
        });
    assert.ok(result.optimisticGraph, 'should have created optimistic graph');
    assert.ok(result.pessimisticGraph, 'should have created pessimistic graph');
  });
});
