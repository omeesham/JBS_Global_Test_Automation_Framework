"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUG_HUNT_TO_DISPOSITION = exports.AutonomyDecision = exports.TestIdStatus = exports.ChangeSize = exports.BugHuntCategory = exports.BugSeverity = exports.TriageConfidence = exports.TriageDisposition = exports.FailureCategory = void 0;
var FailureCategory;
(function (FailureCategory) {
    FailureCategory["AUTH"] = "AUTH";
    FailureCategory["NETWORK"] = "NETWORK";
    FailureCategory["SELECTOR"] = "SELECTOR";
    FailureCategory["TIMING"] = "TIMING";
    FailureCategory["APPLICATION"] = "APPLICATION";
    FailureCategory["DATA"] = "DATA";
    FailureCategory["INFRASTRUCTURE"] = "INFRASTRUCTURE";
    FailureCategory["UNKNOWN"] = "UNKNOWN";
})(FailureCategory || (exports.FailureCategory = FailureCategory = {}));
var TriageDisposition;
(function (TriageDisposition) {
    TriageDisposition["BUG"] = "BUG";
    TriageDisposition["FEATURE_CHANGE"] = "FEATURE_CHANGE";
    TriageDisposition["TEST_DEFECT"] = "TEST_DEFECT";
    TriageDisposition["UNCERTAIN"] = "UNCERTAIN";
})(TriageDisposition || (exports.TriageDisposition = TriageDisposition = {}));
var TriageConfidence;
(function (TriageConfidence) {
    TriageConfidence["HIGH"] = "HIGH";
    TriageConfidence["MEDIUM"] = "MEDIUM";
    TriageConfidence["LOW"] = "LOW";
})(TriageConfidence || (exports.TriageConfidence = TriageConfidence = {}));
var BugSeverity;
(function (BugSeverity) {
    BugSeverity["CRITICAL"] = "CRITICAL";
    BugSeverity["HIGH"] = "HIGH";
    BugSeverity["MEDIUM"] = "MEDIUM";
    BugSeverity["LOW"] = "LOW";
})(BugSeverity || (exports.BugSeverity = BugSeverity = {}));
var BugHuntCategory;
(function (BugHuntCategory) {
    BugHuntCategory["UNCHANGED_FAILURE"] = "UNCHANGED_FAILURE";
    BugHuntCategory["FEATURE_CHANGED_SMALL"] = "FEATURE_CHANGED_SMALL";
    BugHuntCategory["FEATURE_CHANGED_BIG"] = "FEATURE_CHANGED_BIG";
    BugHuntCategory["TESTID_MISSING"] = "TESTID_MISSING";
    BugHuntCategory["TESTID_CHANGED"] = "TESTID_CHANGED";
    BugHuntCategory["FLAKE"] = "FLAKE";
    BugHuntCategory["INFRASTRUCTURE_TRANSIENT"] = "INFRASTRUCTURE_TRANSIENT";
})(BugHuntCategory || (exports.BugHuntCategory = BugHuntCategory = {}));
var ChangeSize;
(function (ChangeSize) {
    ChangeSize["SMALL"] = "SMALL";
    ChangeSize["BIG"] = "BIG";
})(ChangeSize || (exports.ChangeSize = ChangeSize = {}));
var TestIdStatus;
(function (TestIdStatus) {
    TestIdStatus["PRESENT"] = "PRESENT";
    TestIdStatus["MISSING"] = "MISSING";
    TestIdStatus["CHANGED"] = "CHANGED";
})(TestIdStatus || (exports.TestIdStatus = TestIdStatus = {}));
var AutonomyDecision;
(function (AutonomyDecision) {
    AutonomyDecision["AUTONOMOUS"] = "AUTONOMOUS";
    AutonomyDecision["HUMAN_REVIEW"] = "HUMAN_REVIEW";
})(AutonomyDecision || (exports.AutonomyDecision = AutonomyDecision = {}));
exports.BUG_HUNT_TO_DISPOSITION = {
    [BugHuntCategory.UNCHANGED_FAILURE]: TriageDisposition.BUG,
    [BugHuntCategory.TESTID_MISSING]: TriageDisposition.BUG,
    [BugHuntCategory.TESTID_CHANGED]: TriageDisposition.FEATURE_CHANGE,
    [BugHuntCategory.FEATURE_CHANGED_SMALL]: TriageDisposition.FEATURE_CHANGE,
    [BugHuntCategory.FEATURE_CHANGED_BIG]: TriageDisposition.FEATURE_CHANGE,
    [BugHuntCategory.FLAKE]: TriageDisposition.TEST_DEFECT,
    [BugHuntCategory.INFRASTRUCTURE_TRANSIENT]: TriageDisposition.TEST_DEFECT,
};
