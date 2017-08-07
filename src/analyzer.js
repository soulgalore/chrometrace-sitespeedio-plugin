const Trace = require('devtools-timeline-model');

function normalizeActivityName(key) {
  return key.replace(/\s/g, '');
}

function analyzer(events) {
  const model = new Trace(events);

  // Get activies data
  // EventName -> Activity in Google Chrome Dev timeline
  const activities = model.bottomUpGroupBy('EventName').children;

  let results = {
    timeline: {
      activity: {},
      category: {}
    }
  };

  for (const [key, value] of activities) {
    results.timeline.activity[normalizeActivityName(key)] = value.totalTime;
  }

  // Get categories data
  // @NOTE scripting is 10% less than in Chrome
  // @NOTE other category is missing
  // @NOTE idle category is missing
  const categories = model.bottomUpGroupBy('Category').children;

  for (const [key, value] of categories) {
    results.timeline.category[normalizeActivityName(key)] = value.totalTime;
  }

  return results;
}

module.exports = analyzer;
