"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function toUtcDate(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
exports.toUtcDate = toUtcDate;
function getHttpResposeJson(data, clearClientCache) {
    return {
        status: 200,
        data: data,
        clearCache: clearClientCache != undefined && clearClientCache
    };
}
exports.getHttpResposeJson = getHttpResposeJson;
function getHttpResponseError() {
}
exports.getHttpResponseError = getHttpResponseError;
//# sourceMappingURL=helpers.js.map