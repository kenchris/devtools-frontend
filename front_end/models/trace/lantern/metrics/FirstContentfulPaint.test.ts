// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as Lantern from '../lantern.js';
import {getComputationDataFromFixture, loadTrace} from '../testing/MetricTestUtils.js';

const {FirstContentfulPaint} = Lantern.Metrics;

describe('Metrics: Lantern FCP', () => {
  let trace: Lantern.Trace;
  before(async function() {
    trace = await loadTrace(this, 'lantern/progressive-app/trace.json.gz');
  });

  it('should compute predicted value', async () => {
    const data = await getComputationDataFromFixture({trace});
    const result = await FirstContentfulPaint.compute(data);

    assert.deepStrictEqual(
        {
          timing: Math.round(result.timing),
          optimistic: Math.round(result.optimisticEstimate.timeInMs),
          pessimistic: Math.round(result.pessimisticEstimate.timeInMs),
          optimisticNodeTimings: result.optimisticEstimate.nodeTimings.size,
          pessimisticNodeTimings: result.pessimisticEstimate.nodeTimings.size,
        },
        {
          timing: 1107,
          optimistic: 1107,
          pessimistic: 1107,
          optimisticNodeTimings: 4,
          pessimisticNodeTimings: 4,
        });
    assert.ok(result.optimisticGraph, 'should have created optimistic graph');
    assert.ok(result.pessimisticGraph, 'should have created pessimistic graph');
  });

  it('should handle negative request networkEndTime', async () => {
    const data = await getComputationDataFromFixture({trace});
    assert(data.graph.type === 'network');
    data.graph.request.networkEndTime = -1;
    const result = await FirstContentfulPaint.compute(data);

    const optimisticNodes: Lantern.NetworkNode[] = [];
    result.optimisticGraph.traverse(node => {
      if (node.type === 'network') {
        optimisticNodes.push(node);
      }
    });
    expect(optimisticNodes.map(node => node.request.url)).to.deep.equal(['https://squoosh.app/']);

    const pessimisticNodes: Lantern.NetworkNode[] = [];
    result.pessimisticGraph.traverse(node => {
      if (node.type === 'network') {
        pessimisticNodes.push(node);
      }
    });
    expect(pessimisticNodes.map(node => node.request.url)).to.deep.equal(['https://squoosh.app/']);
  });
});
