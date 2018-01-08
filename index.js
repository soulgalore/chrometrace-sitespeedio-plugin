const messageMaker = require("sitespeed.io/lib/support/messageMaker");
const analyzer = require("./src/analyzer");
const aggregator = require("./src/aggregator");
const fs = require("fs");
const path = require("path");

// We need to prefix the plugin name with 'browsertime' to force
// lib/plugins/graphite to add connectivity
// https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/graphite/data-generator.js#L12
const pluginName = "browsertimeChrometrace";
const make = messageMaker(pluginName).make;

let runIndex = {};

function processChrometraceMessage(message, queue, statsHelpers, options) {
  const { url, group, data } = message;
  const results = analyzer(data);

  aggregator.addToAggregate(results, url, statsHelpers);

  if (typeof runIndex[url] === "undefined") {
    runIndex[url] = 0;
  }

  queue.postMessage(
    make(
      `${pluginName}.run`,
      {
        runIndex: runIndex[url],
        data: results
      },
      {
        url,
        group,
        runIndex: runIndex[url]
      }
    )
  );

  runIndex[url] = runIndex[url] + 1;

  // Trigger pageSummary for each last run
  if (runIndex[url] === options.iterations) {
    queue.postMessage(
      make(
        `${pluginName}.pageSummary`,
        aggregator.getSummary(url, statsHelpers),
        {
          url,
          group
        }
      )
    );
  }
}

module.exports = {
  name() {
    return pluginName;
  },

  open(context, options) {
    this.options = options.chrometrace || {};
    this.options.iterations = options.browsertime.iterations;
    this.statsHelpers = context.statsHelpers;
    this.pug = fs.readFileSync(
      path.resolve(__dirname, "src", "pug", "index.pug"),
      "utf8"
    );
  },

  processMessage(message, queue) {
    if (message.type === "sitespeedio.setup") {
      queue.postMessage(
        make("html.pug", {
          id: pluginName,
          name: "Chrome trace",
          pug: this.pug,
          type: "run"
        })
      );
      queue.postMessage(
        make("html.pug", {
          id: pluginName,
          name: "Chrome trace",
          pug: this.pug,
          type: "pageSummary"
        })
      );
      return;
    } else if (message.type !== "browsertime.chrometrace") {
      return;
    }

    return processChrometraceMessage(
      message,
      queue,
      this.statsHelpers,
      this.options
    );
  }
};
