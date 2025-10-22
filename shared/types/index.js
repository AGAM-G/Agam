"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStatus = exports.TestType = void 0;
// Test Types
var TestType;
(function (TestType) {
    TestType["API"] = "API";
    TestType["E2E"] = "E2E";
    TestType["LOAD"] = "LOAD";
    TestType["UI"] = "UI";
})(TestType || (exports.TestType = TestType = {}));
var TestStatus;
(function (TestStatus) {
    TestStatus["PENDING"] = "pending";
    TestStatus["RUNNING"] = "running";
    TestStatus["PASSED"] = "passed";
    TestStatus["FAILED"] = "failed";
    TestStatus["SKIPPED"] = "skipped";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
//# sourceMappingURL=index.js.map