const forEach = require('lodash.foreach');
const statsHelpers = require('sitespeed.io/lib/support/statsHelpers');

let aggregated = {}
let grouped = {}
let summary = {}

function walkStats(timelineRun, cb) {
  forEach(timelineRun, (groups, typeName) => {
    forEach(groups, (groupMetrics, groupName) => {
      forEach(groupMetrics, (value, name) => cb(typeName, groupName, name, value));
    });
  });
}

function addToAggregate(timelineRun, url) {
  if (typeof aggregated[url] === 'undefined') {
    aggregated[url] = {};
  }

  walkStats(timelineRun, (typeName, groupName, name, value) => {
    statsHelpers.pushGroupStats(
      aggregated[url],
      grouped,
      [typeName, groupName, name],
      value
    )
  });
}

function getSummary(url) {
  walkStats(aggregated[url], (typeName, groupName, name, value) =>
    statsHelpers.setStatsSummary(
      summary,
      [typeName, groupName, name],
      value
    )
  )

  return summary;
}

module.exports = {
  addToAggregate,
  getSummary,
  aggregated
};
