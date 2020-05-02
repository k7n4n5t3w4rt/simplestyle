"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var numToAlpha_1 = __importDefault(require("./numToAlpha"));
var inc = Date.now();
var numPairsRegex = /(\d{1,2})/g;
function getUniqueSuffix(uid) {
    if (uid === void 0) { uid = null; }
    var numPairs = [];
    var incStr = inc.toString();
    var out = '_';
    if (uid !== null) {
        out += uid;
    }
    else {
        var result = numPairsRegex.exec(incStr);
        while (result) {
            numPairs.push(result[0]);
            result = numPairsRegex.exec(incStr);
        }
        numPairs.forEach(function (pair) {
            var val = +pair;
            if (val > 25) {
                var _a = pair.split(''), first = _a[0], second = _a[1];
                out += "" + numToAlpha_1.default(+first) + numToAlpha_1.default(+second);
            }
            else
                out += numToAlpha_1.default(val);
        });
        inc += 1;
    }
    return out;
}
exports.getUniqueSuffix = getUniqueSuffix;
function generateClassName(c) {
    return "" + c[0] + getUniqueSuffix(c[1]);
}
exports.default = generateClassName;
