"use strict";

//polyfill for microsecond-time
//https://gist.github.com/paulirish/5438650
(function() {
    if (!Date.now) {
        Date.now = function() {
            return new Date().getTime();
        }
    }

    // prepare base perf object
    if (typeof window.performance === 'undefined') {
        window.performance = {};
    }

    if (!window.performance.now || window.performance.now === undefined) {
        let nowOffset = Date.now();

        if (performance.timing && performance.timing.navigationStart) {
            nowOffset = performance.timing.navigationStart;
        }


        window.performance.now = function now() {
            return Date.now() - nowOffset;
        }
    }
})();


function nowMs() {
    return window.performance.now();
}

function nowNs() {
    return Math.round(window.performance.now() * 1e6); //from ms to ns
}


/**
 * Creates a new cyclic barrier
 * @param {number} parties the number of threads that must invoke await()
 *      before the barrier is tripped
 * @see http://docs.oracle.com/javase/7/docs/api/java/util/concurrent/CyclicBarrier.html
 */
function CyclicBarrier(parties) {
    "use strict";
    const _parties = parties;
    let _callbacks = [];

    const release = () => {
        //first, copy and clear callbacks
        //to prohibit that a callback registers before all others are released
        let tmp = _callbacks.slice();
        _callbacks = [];
        self.setTimeout(() => {
            for (let i = 0; i < _parties; i++) {
                //prevent side effects in last function that called "await"
                tmp[i]();
            }
        }, 1);
    };

    return {
        /**
         * Waits until all parties have invoked await on this barrier
         * The current context is disabled in any case.
         *
         * As soon as all threads have called 'await', all callbacks will
         * be executed
         * @param {Function} callback
         */
        await: (callback) => {
            _callbacks.push(callback);
            if (_callbacks.length === _parties) {
                release();
            }
        }

    }
};


/**
 * Finds the median number in the given array
 * http://caseyjustus.com/finding-the-median-of-an-array-with-javascript
 * @param {Array} values
 * @returns {Number} the median
 */
Math.median = function(values) {
    values.sort(function(a, b) {
        return a - b;
    });

    let half = Math.floor(values.length / 2);

    if (values.length % 2) {
        return values[half];
    } else {
        return (values[half - 1] + values[half]) / 2.0;
    }
};


// Polyfill log10 for internet explorer
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Math/log10#Polyfill
Math.log10 = Math.log10 || function (x) {
    return Math.log(x) / Math.LN10;
};

//"loglevel" module is used, but if not available, it will fallback to console.log
self.log = self.log || {
    debug: function debug() {
        let _console;

        (_console = new MockLogger()).log.apply(_console, arguments);
    },
    trace: function trace() {
        new MockLogger().trace();
    },
    info: function info() {
        let _console2;

        (_console2 = new MockLogger()).info.apply(_console2, arguments);
    },
    warn: function warn() {
        let _console3;

        (_console3 = new MockLogger()).warn.apply(_console3, arguments);
    },
    error: function error() {
        let _console4;

        (_console4 = new MockLogger()).error.apply(_console4, arguments);
    },
    setLevel: function setLevel() {},
    getLogger: function getLogger() {
        return log;
    }
};


//Polyfill
if (typeof Object.assign != 'function') {
    Object.assign = function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) { // Skip over if undefined or null
                for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

//"hidden" polyfill (in this case: always visible)
if (typeof document.hidden === "undefined") {
    document.hidden = false;
}
