---
layout: layouts/docs.njk
title: Writing Contract Proof
description: Side-by-side copy benchmark for the UIF Natural Writing Contract.
navTitle: Writing Contract Proof
order: 90
permalink: /examples/writing-contract-proof/
---

This page keeps the subject and facts fixed while changing only the writing. Use each sample as a complete block in the same scoring tool and record the result without editing the text first.

## Test protocol

1. Copy **Original** into the scoring tool and record the result.
2. Start a new analysis in the same tool.
3. Copy **Rewritten** and record the result.
4. Compare the scores and highlighted passages.
5. Judge the copy separately for clarity, specificity, evidence, and fit for purpose.

External AI-detection scores are supporting evidence only. The UIF contract is intended to improve writing quality, not to guarantee a particular detector result.

## Sample 1: Product documentation

### Original

> UI Foundations plays a crucial role in creating consistent and scalable digital experiences. It provides a comprehensive collection of tokens, patterns, components, and guidance that empowers teams to build high-quality interfaces efficiently. Furthermore, the system helps bridge the gap between design and development, ensuring that teams can work together seamlessly. By providing a shared foundation, UI Foundations not only improves consistency but also enables teams to move faster and make better decisions. In conclusion, UI Foundations is an essential resource for teams looking to create cohesive, accessible, and future-ready digital products.

### Rewritten

> UI Foundations gives designers and developers the same tokens, patterns, components, and implementation guidance. A designer can reference a semantic token or pattern and a developer can trace it to the corresponding runtime API. Shared definitions reduce interpretation during handoff and make differences easier to spot in review. The system does not decide whether an interface is good; it makes the agreed foundations explicit enough to inspect, implement, and change.

## Sample 2: Design-system governance

### Original

> Effective governance is vital to the long-term success of any design system. As design systems continue to evolve, teams face a wide range of challenges, from maintaining consistency to balancing flexibility and control. It is important to note that governance is not only about rules, but also about enabling collaboration, alignment, and innovation. A strong governance model can help organizations navigate these challenges while ensuring that the system remains scalable and sustainable. Ultimately, governance provides the foundation for a mature and successful design system.

### Rewritten

> Governance defines who may change the system, which evidence a change needs, and who approves it. Without those decisions, two teams can follow the same component documentation and still resolve exceptions differently. UIF keeps governance separate from implementation so a runtime change cannot silently redefine the rules that authorize it. When an exception is needed, the decision should be visible and reviewable rather than hidden in a component or prompt.

## Sample 3: Agent-assisted maintenance

### Original

> AI-powered agents have the potential to revolutionize design-system maintenance by automating repetitive tasks, identifying inconsistencies, and supporting teams in their day-to-day workflows. From accessibility audits to documentation updates and token validation, agents can provide valuable assistance across a wide range of activities. However, it is important to strike the right balance between automation and human oversight. By combining the strengths of AI with human expertise, teams can unlock new levels of efficiency while maintaining quality and trust.

### Rewritten

> An agent can check token names, compare documentation with runtime APIs, or prepare an accessibility finding for review. Those tasks are useful because the expected result can be verified. Approval remains with a person when the work changes product behavior, governance, or an accepted decision. UIF therefore separates execution from authority: an agent may prepare a change without gaining the right to approve that change.

## Sample 4: UX copy

### Original

**Heading:** Welcome to your booking experience

**Body:** We're delighted to help you find the perfect option for your needs. Simply enter your details below and explore the available choices to continue your journey.

**Field label:** Destination

**Placeholder:** Enter your destination

**Checkbox:** I would like to receive exciting offers and updates

**Primary action:** Continue your journey

### Rewritten

**Heading:** Find your trip

**Body:** Choose a destination and travel date to see available options.

**Field label:** Destination

**Placeholder:** City, region, or airport

**Checkbox:** Email me offers and travel updates

**Primary action:** Show available trips

## Sample 5: Pull request summary

### Original

> This PR introduces an important enhancement to the playground experience by improving the way content is presented to users. The changes help make the interface more intuitive, consistent, and user-friendly while also supporting the broader goals of the UI Foundations ecosystem. Additionally, several small refinements have been made to improve clarity and maintainability. Overall, these updates represent another step toward a more polished and cohesive developer experience.

### Rewritten

> This PR adds a page for comparing original copy with copy rewritten under the Natural Writing Contract. It contains five fixed before/after samples and a repeatable test protocol. No component API, token, renderer, or production behavior changes. The page exists to collect evidence for the writing-governance proposal before that proposal is treated as established practice.

## What changed

The rewritten samples remove claims that are not supported by the text, replace generic benefits with observable behavior, and remove conclusions that only repeat earlier sentences. They also preserve structures that have a job: the UX example still uses labels and actions because it is interface copy, while the PR example states scope because reviewers need it.

## Record results

Use the same detector and settings for both versions.

| Sample | Tool | Original score | Rewritten score | Notes |
| --- | --- | ---: | ---: | --- |
| Product documentation |  |  |  |  |
| Governance |  |  |  |  |
| Agent maintenance |  |  |  |  |
| UX copy |  |  |  |  |
| PR summary |  |  |  |  |

A useful result is not simply a lower AI score. Check whether the rewrite is more specific, makes fewer unsupported claims, and still fits the job of the text.
