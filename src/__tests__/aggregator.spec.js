/* eslint-env mocha */

const { expect } = require('chai');

const { aggregated, addToAggregate, getSummary } = require('../aggregator');
const statsHelpers = require('sitespeed.io/lib/support/statsHelpers');
const runs = require('./angular2-hn.firebaseapp.com-timeline.json');

describe('Aggregator', function() {
  const url = '/a/b/c';

  beforeEach(function() {
    aggregated[url] = {};
    runs.forEach(run => addToAggregate(run, url, statsHelpers));
  });

  it('should add run data to the aggregator', function() {
    expect(aggregated[url].timeline.activity);
    expect(aggregated[url].timeline.category);
    expect(aggregated[url].timeline.category.scripting.data.length).to.equal(3);
  });

  it('should summarize data', function() {
    const summary = getSummary(url, statsHelpers);
    expect(summary.timeline.category.scripting.mean).to.equal(309);
  });
});
