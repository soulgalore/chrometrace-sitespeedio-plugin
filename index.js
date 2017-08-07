const messageMaker = require('sitespeed.io/lib/support/messageMaker');

const analyzer = require('./src/analyzer');
const aggregator = require('./src/aggregator');

// We need to prefix the plugin name with 'browsertime' to force
// lib/plugins/graphite to add connectivity
// https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/graphite/data-generator.js#L12
const pluginName = 'browsertimeChrometrace';
const make = messageMaker(pluginName).make;

let runIndex = {};

function processChrometraceMessage(message, queue, options) {
    const { url, group, data } = message;
    const results = analyzer(data);

    aggregator.addToAggregate(results, url);

    if (typeof runIndex[url] === 'undefined') {
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
                runIndex
            }
        )
    );

    runIndex[url] = runIndex[url] + 1;

    // Trigger pageSummary for each last run
    if (runIndex[url] === options.iterations) {
        queue.postMessage(
            make(
                `${pluginName}.pageSummary`,
                aggregator.getSummary(url),
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
        return pluginName
    },

    open(context, options) {
        this.options = options.chrometrace || {};
        this.options.iterations = options.browsertime.iterations;
    },

    processMessage(message, queue) {
        if (message.type !== 'browsertime.chrometrace') {
            return;
        }

        return processChrometraceMessage(message, queue, this.options);
    }
};
