"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var generateClassName_1 = __importDefault(require("./generateClassName"));
var plugins_1 = require("./plugins");
var accumulatedSheetContents = null;
function isNestedSelector(r) {
    return /&/g.test(r);
}
function isMedia(r) {
    return r.toLowerCase().startsWith('@media');
}
function formatCSSRuleName(rule) {
    return rule.replace(/([A-Z])/g, function (p1) { return "-" + p1.toLowerCase(); });
}
function formatCSSRules(cssRules) {
    return Object.entries(cssRules).reduce(function (prev, _a) {
        var cssProp = _a[0], cssVal = _a[1];
        return "" + prev + formatCSSRuleName(cssProp) + ":" + cssVal + ";";
    }, '');
}
function execCreateStyles(rules, options, parentSelector, noGenerateClassName, uid) {
    if (noGenerateClassName === void 0) { noGenerateClassName = false; }
    if (uid === void 0) { uid = null; }
    var out = {};
    var sheetBuffer = '';
    var mediaQueriesbuffer = '';
    var styleEntries = Object.entries(rules);
    var ruleWriteOpen = false;
    var guardCloseRuleWrite = function () {
        if (ruleWriteOpen)
            sheetBuffer += '}';
        ruleWriteOpen = false;
    };
    var _loop_1 = function (classNameOrCSSRule, classNameRules) {
        var _a, _b;
        // if the classNameRules is a string, we are dealing with a display: none; type rule
        if (isMedia(classNameOrCSSRule)) {
            if (typeof classNameRules !== 'object')
                throw new Error('Unable to map @media query because rules / props are an invalid type');
            guardCloseRuleWrite();
            mediaQueriesbuffer += classNameOrCSSRule + "{";
            var _c = execCreateStyles(classNameRules, options, parentSelector, null, uid), regularOutput = _c[1], mediaQueriesOutput = _c[2];
            mediaQueriesbuffer += regularOutput;
            mediaQueriesbuffer += '}';
            mediaQueriesbuffer += mediaQueriesOutput;
        }
        else if (isNestedSelector(classNameOrCSSRule)) {
            if (!parentSelector)
                throw new Error('Unable to generate nested rule because parentSelector is missing');
            guardCloseRuleWrite();
            // format of { '& > span': { display: 'none' } } (or further nesting)
            var replaced = classNameOrCSSRule.replace(/&/g, parentSelector);
            replaced.split(/,\s*/).forEach(function (selector) {
                var _a = execCreateStyles(classNameRules, options, selector, null, uid), regularOutput = _a[1], mediaQueriesOutput = _a[2];
                sheetBuffer += regularOutput;
                mediaQueriesbuffer += mediaQueriesOutput;
            });
        }
        else if (!parentSelector && typeof classNameRules === 'object') {
            guardCloseRuleWrite();
            var generated = generateClassName_1.default([classNameOrCSSRule, uid]);
            if (noGenerateClassName) {
                generated = classNameOrCSSRule;
            }
            out[classNameOrCSSRule] = generated;
            var generatedSelector = "" + (noGenerateClassName ? '' : '.') + generated;
            var _d = execCreateStyles(classNameRules, options, generatedSelector, null, uid), regularOutput = _d[1], mediaQueriesOutput = _d[2];
            sheetBuffer += regularOutput;
            mediaQueriesbuffer += mediaQueriesOutput;
        }
        else {
            if (!parentSelector)
                throw new Error('Unable to write css props because parent selector is null');
            if (!ruleWriteOpen) {
                sheetBuffer += parentSelector + "{" + formatCSSRules((_a = {}, _a[classNameOrCSSRule] = classNameRules, _a));
                ruleWriteOpen = true;
            }
            else
                sheetBuffer += formatCSSRules((_b = {}, _b[classNameOrCSSRule] = classNameRules, _b));
        }
    };
    for (var _i = 0, styleEntries_1 = styleEntries; _i < styleEntries_1.length; _i++) {
        var _a = styleEntries_1[_i], classNameOrCSSRule = _a[0], classNameRules = _a[1];
        _loop_1(classNameOrCSSRule, classNameRules);
    }
    guardCloseRuleWrite();
    return [out, sheetBuffer, mediaQueriesbuffer];
}
function replaceBackReferences(out, sheetContents) {
    var outputSheetContents = sheetContents;
    var toReplace = [];
    var toReplaceRegex = /\$\w([a-zA-Z0-9_-]+)?/gm;
    var matches = toReplaceRegex.exec(outputSheetContents);
    while (matches) {
        toReplace.push(matches[0].valueOf());
        matches = toReplaceRegex.exec(outputSheetContents);
    }
    for (var _i = 0, toReplace_1 = toReplace; _i < toReplace_1.length; _i++) {
        var r = toReplace_1[_i];
        outputSheetContents = outputSheetContents.replace(r, "." + out[r.substring(1)]);
    }
    return plugins_1.getPosthooks().reduce(function (prev, hook) { return hook(prev); }, outputSheetContents);
}
function flushSheetContents(sheetContents) {
    // In case we're in come weird test environment that doesn't support JSDom
    if (typeof document !== 'undefined' && document.head && document.head.appendChild) {
        var styleTag = document.createElement('style');
        styleTag.innerHTML = sheetContents;
        document.head.appendChild(styleTag);
    }
}
function coerceCreateStylesOptions(options) {
    return {
        accumulate: (options === null || options === void 0 ? void 0 : options.accumulate) || false,
        flush: options && typeof options.flush === 'boolean' ? options.flush : true,
    };
}
var accumulatedTimeout;
function accumulateSheetContents(sheetContents, options) {
    if (!accumulatedSheetContents)
        accumulatedSheetContents = [];
    accumulatedSheetContents.push(sheetContents);
    if (accumulatedTimeout)
        accumulatedTimeout = clearTimeout(accumulatedTimeout);
    accumulatedTimeout = setTimeout(function () {
        flushSheetContents(accumulatedSheetContents.reduce(function (prev, contents) { return "" + prev + contents; }, ''));
        accumulatedSheetContents = null;
    }, 0);
}
function rawStyles(rules, options, uid) {
    if (options === void 0) { options = null; }
    if (uid === void 0) { uid = null; }
    var coerced = coerceCreateStylesOptions(options);
    var _a = execCreateStyles(rules, coerced, null, true, uid), sheetContents = _a[1], mediaQueriesContents = _a[2];
    var mergedContents = "" + sheetContents + mediaQueriesContents;
    if (coerced.accumulate)
        accumulateSheetContents(mergedContents, coerced);
    else if (coerced.flush)
        flushSheetContents(mergedContents);
    return mergedContents;
}
exports.rawStyles = rawStyles;
function keyframes(frames, options, uid) {
    if (options === void 0) { options = null; }
    if (uid === void 0) { uid = null; }
    var coerced = coerceCreateStylesOptions(options);
    var keyframeName = generateClassName_1.default(['keyframes_']);
    var _a = execCreateStyles(frames, coerced, null, true, uid), out = _a[0], keyframesContents = _a[1];
    // const keyframesContents = generateSheetContents(out, toRender);
    var sheetContents = "@keyframes " + keyframeName + "{" + keyframesContents + "}";
    if (coerced.accumulate)
        accumulateSheetContents(sheetContents, coerced);
    if (coerced.flush)
        flushSheetContents(sheetContents);
    return [keyframeName, sheetContents];
}
exports.keyframes = keyframes;
function createStyles(rules, options, uid) {
    if (options === void 0) { options = null; }
    if (uid === void 0) { uid = null; }
    var coerced = coerceCreateStylesOptions(options);
    var _a = execCreateStyles(rules, coerced, null, null, uid), out = _a[0], sheetContents = _a[1], mediaQueriesContents = _a[2];
    var mergedContents = "" + sheetContents + mediaQueriesContents;
    var replacedSheetContents = replaceBackReferences(out, mergedContents);
    if (coerced.accumulate)
        accumulateSheetContents(replacedSheetContents, coerced);
    else if (coerced.flush)
        flushSheetContents(replacedSheetContents);
    return [out, replacedSheetContents];
}
exports.default = createStyles;
