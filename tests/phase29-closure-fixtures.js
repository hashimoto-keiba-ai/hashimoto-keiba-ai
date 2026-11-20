"use strict";

// Build each upstream handoff through the production APIs. Never execute a test file to obtain a record.
const buildFollowupSource = require("./phase29-followup-fixture");

function fixtureInput(core, fields, isEvidence) {
  const input = {};
  for (const field of fields) input[field] = isEvidence(field) ? {confirmed: true} : field;
  for (const field of core.ARRAY_FIELDS) input[field] = [];
  for (const field of core.REQUIRED_TRUE) input[field] = true;
  return input;
}

function handoff10() {
  const core = require("../phase29-10-phase29-post-start-stabilization-followup-core.js");
  const NOW = "2027-01-07T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual closure review", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.FOLLOWUP_FIELDS, field =>
    field.endsWith("Evidence") || field.endsWith("Snapshot") ||
    ["confirmationResults", "actionsPerformed", "additionalActions", "residualRisks"].includes(field));
  input.observationStartedAt = "2027-01-05T00:00:00Z";
  input.observationEndedAt = "2027-01-06T00:00:00Z";
  const created = core.createStabilizationFollowupRecord(buildFollowupSource(), input, human, options, []);
  if (!created.created) throw new Error(created.reasons.join(", "));
  let record = core.beginStabilizationFollowup(created.record, human, options).record;
  record = core.submitStabilizationFollowupReview(record, human, options).record;
  const completed = core.completeStabilizationFollowup(record, {
    result: "phase29_post_start_stabilization_followup_completed",
    followupSummary: "completed",
    followupAfterSnapshot: {stable: true},
    completedBy: "operator",
    completedAt: NOW
  }, human, options);
  if (!completed.completed) throw new Error(completed.reasons.join(", "));
  const handoff = core.handoffToStabilizationClosureReview(completed.record, human, options);
  if (!handoff.handedOff) throw new Error("Phase29-10 handoff failed");
  return handoff.record;
}

function handoff11() {
  const core = require("../phase29-11-phase29-post-start-stabilization-closure-review-core.js");
  const NOW = "2027-01-07T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual closure review", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.REVIEW_FIELDS, k => k.endsWith("Evidence")||k.endsWith("Snapshot")||k.endsWith("Plan")||["closureConditions","completionConditions","handoverItems","residualRisks"].includes(k));
  const ready={result:"phase29_post_start_stabilization_closure_review_ready_for_closure",reviewSummary:"ready",closureReviewAfterSnapshot:{ready:true},completedBy:"reviewer",completedAt:NOW};
  const x=core.createStabilizationClosureReviewRecord(handoff10(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.beginStabilizationClosureReview(r,human,options).record;
  r=core.submitStabilizationClosureReview(r,human,options).record;
  const ok = core.completeStabilizationClosureReview(r,ready,human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosureDecision(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-11 handoff failed");
  return hand.record;
}

function handoff12() {
  const core = require("../phase29-12-phase29-post-start-stabilization-closure-decision-core.js");
  const NOW = "2027-01-09T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual closure decision", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.DECISION_FIELDS, k => k.endsWith("Evidence")||k.endsWith("Snapshot")||k.endsWith("Plan")||["closureConditions","completionConditions","handoverItems","residualRisks"].includes(k));
  const approved={result:"approve_phase29_post_start_stabilization_closure",decisionSummary:"approved",decisionAfterSnapshot:{approved:true},approvedBy:"approver",approvedAt:NOW};
  const x=core.createStabilizationClosureDecisionRecord(handoff11(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.beginStabilizationClosureDecision(r,human,options).record;
  r=core.submitStabilizationClosureDecisionReview(r,human,options).record;
  const ok = core.decideStabilizationClosure(r,approved,human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosureExecutionPreparation(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-12 handoff failed");
  return hand.record;
}

function handoff13() {
  const core = require("../phase29-13-phase29-post-start-stabilization-closure-execution-preparation-core.js");
  const NOW = "2027-01-10T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual execution preparation", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.PREPARATION_FIELDS, k => k.endsWith("Snapshot")||k.endsWith("Checks")||k.endsWith("Boundary")||k.endsWith("Evidence")||k==="dataIntegrity");
  const ready={result:"ready_phase29_post_start_stabilization_closure_execution_preparation",preparationSummary:"ready",preparationAfterSnapshot:{ready:true},completedBy:"preparer",completedAt:NOW};
  const x=core.createStabilizationClosureExecutionPreparationRecord(handoff12(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.startStabilizationClosureExecutionPreparation(r,human,options).record;
  r=core.beginStabilizationClosureExecutionPreparation(r,human,options).record;
  r=core.submitStabilizationClosureExecutionPreparationReview(r,human,options).record;
  const ok = core.completeStabilizationClosureExecutionPreparation(r,ready,human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosureExecutionApproval(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-13 handoff failed");
  return hand.record;
}

function handoff14() {
  const core = require("../phase29-14-phase29-post-start-stabilization-closure-execution-approval-core.js");
  const NOW = "2027-01-11T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual execution approval", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.APPROVAL_FIELDS, k => k.endsWith("Snapshot")||k.endsWith("Checks")||k.endsWith("Boundary")||k.endsWith("Evidence")||k==="dataIntegrity");
  const approved={result:"approve_phase29_post_start_stabilization_closure_execution",approvalSummary:"approved",approvalAfterSnapshot:{approved:true},decisionBy:"approver",decisionAt:NOW};
  const x=core.createStabilizationClosureExecutionApprovalRecord(handoff13(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.startStabilizationClosureExecutionApproval(r,human,options).record;
  r=core.beginStabilizationClosureExecutionApproval(r,human,options).record;
  r=core.submitStabilizationClosureExecutionApprovalReview(r,human,options).record;
  const ok = core.decideStabilizationClosureExecutionApproval(r,approved,human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosureExecution(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-14 handoff failed");
  return hand.record;
}

function handoff15() {
  const core = require("../phase29-15-phase29-post-start-stabilization-closure-execution-core.js");
  const NOW = "2027-01-12T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual execution record", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.CREATION_FIELDS, k => k.endsWith("Snapshot")||k.endsWith("Checks")||k.endsWith("Boundary")||k.endsWith("Evidence")||k==="dataIntegrity");
  function completion(p={}){return{result:"complete_phase29_post_start_stabilization_closure_execution",executionStartedAt:"2027-01-12T01:00:00Z",executionCompletedAt:"2027-01-12T02:00:00Z",postExecutionSnapshot:{completed:true},executionResult:"completed",...p}}
  const x=core.createStabilizationClosureExecutionRecord(handoff14(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.startStabilizationClosureExecution(r,human,options).record;
  r=core.beginStabilizationClosureExecution(r,human,options).record;
  r=core.submitStabilizationClosureExecutionReview(r,human,options).record;
  const ok = core.completeStabilizationClosureExecution(r,completion(),human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosurePostExecutionVerification(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-15 handoff failed");
  return hand.record;
}

function handoff16() {
  const core = require("../phase29-16-phase29-post-start-stabilization-closure-post-execution-verification-core.js");
  const NOW = "2027-01-13T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual post-execution verification", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.CREATION_FIELDS, k => k.endsWith("Snapshot")||k.endsWith("Boundary")||k.endsWith("Evidence"));
  function verified(p={}){return{result:"verify_phase29_post_start_stabilization_closure_post_execution",actualResult:{verified:true},difference:{none:true},performance:{stable:true},dataIntegrity:{valid:true},verificationStartedAt:"2027-01-13T01:00:00Z",verificationCompletedAt:"2027-01-13T02:00:00Z",...p}}
  const x=core.createStabilizationClosurePostExecutionVerificationRecord(handoff15(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.startStabilizationClosurePostExecutionVerification(r,human,options).record;
  r=core.beginStabilizationClosurePostExecutionVerification(r,human,options).record;
  r=core.submitStabilizationClosurePostExecutionVerificationReview(r,human,options).record;
  const ok = core.completeStabilizationClosurePostExecutionVerification(r,verified(),human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosurePostExecutionVerificationDecision(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-16 handoff failed");
  return hand.record;
}

function handoff17() {
  const core = require("../phase29-17-phase29-post-start-stabilization-closure-post-execution-verification-decision-core.js");
  const NOW = "2027-01-14T00:00:00Z";
  const options = {now: () => new Date(NOW)};
  const human = {performedBy: "human", reason: "manual verification decision", explicitConfirmation: true, performedAt: NOW};
  const input = fixtureInput(core, core.DECISION_FIELDS, k => k.endsWith("Snapshot")||k.endsWith("Boundary")||k.endsWith("Evidence")||["actualResult","difference","performance","dataIntegrity"].includes(k));
  const approved={result:"approve_phase29_post_start_stabilization_closure_post_execution_verification",decisionSummary:"approved",decisionAfterSnapshot:{approved:true},decisionAt:NOW};
  const x=core.createStabilizationClosurePostExecutionVerificationDecisionRecord(handoff16(), input, human, options, []);
  if (!x.created) throw new Error(x.reasons.join(", "));
  let r = x.record;
  r=core.startStabilizationClosurePostExecutionVerificationDecision(r,human,options).record;
  r=core.beginStabilizationClosurePostExecutionVerificationDecision(r,human,options).record;
  r=core.submitStabilizationClosurePostExecutionVerificationDecisionReview(r,human,options).record;
  const ok = core.decideStabilizationClosurePostExecutionVerification(r,approved,human,options);
  if (!ok.completed && !ok.decided) throw new Error(ok.reasons.join(", "));
  const hand = core.handoffToStabilizationClosureAcceptance(ok.record,human,options);
  if (!hand.handedOff) throw new Error("Phase29-17 handoff failed");
  return hand.record;
}

module.exports = {handoff10, handoff11, handoff12, handoff13, handoff14, handoff15, handoff16, handoff17};
