"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var posthooks = [];
function getPosthooks() {
    return posthooks;
}
exports.getPosthooks = getPosthooks;
function registerPosthook(posthook) {
    posthooks.push(posthook);
}
exports.registerPosthook = registerPosthook;
