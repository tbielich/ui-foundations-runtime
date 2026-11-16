---
title: Cloud-ready tasks (UI Foundations)
status: active
type: agent-guide
---

# Cloud-ready tasks

This guide explains how a bounded Runtime issue becomes eligible for
workstation-independent UIF-INT execution. It documents the Runtime-side
contract only. It does not make Runtime the orchestration authority: the
reasoning, routing, contracting, and verification stay in UIF-INT.

## What a cloud-ready task is

1. A cloud-ready task is a single bounded work item. Creating an issue is not
   authorization on its own; the issue only describes the bounded work.
2. Human authorization is the `agent:ready` label. Without it the issue must not
   be executed.
3. The issue must define its own boundary before it is eligible:
   - outcome,
   - exact or narrowly scoped allowed paths,
   - forbidden paths,
   - base branch,
   - acceptance criteria,
   - required evidence.

## Execution boundaries

4. Cloud execution must fail closed. If a required capability is unavailable, or
   the task needs local-only access, it stops instead of guessing or widening
   scope.
5. Execution may publish a branch and a pull request only. It must never merge
   automatically.

## Verification and merge

6. Independent read-only verification must correlate the issue and task
   identity, the published branch, the commit, the exact changed paths, the pull
   request, and the verification and acceptance evidence. Branch existence alone
   is not acceptance.
7. Human review remains the final merge gate.

## Where orchestration lives

8. Keep orchestration implementation details in UIF-INT. Do not duplicate
   UIF-INT internals here; this guide records only the Runtime-facing contract a
   bounded issue must satisfy.
