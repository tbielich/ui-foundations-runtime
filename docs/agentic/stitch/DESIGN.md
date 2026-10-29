---
version: alpha
name: UIF bounded palette Brand A Light
description: Documentation snapshot from Runtime 86e1d2a; not a canonical token source.
colors:
  primary: "#000000"
  surface: "#FFFFFF"
  content: "#333333"
  border: "#000000"
  green-500: "#AFC36F"
  green-700: "#899E42"
  green-900: "#515D27"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "2rem"
    lineHeight: "2.75rem"
    fontWeight: 700
  body:
    fontFamily: "Inter"
    fontSize: "1rem"
    lineHeight: "1.5rem"
    fontWeight: 400
  label:
    fontFamily: "Inter"
    fontSize: ".875rem"
    lineHeight: "1.25rem"
    fontWeight: 400
rounded:
  card: ".25rem"
spacing:
  page: "2rem"
  section: "1.5rem"
  gap: "1rem"
  card-padding: "1rem"
  inner: ".5rem"
omitted:
  - section: components
    reason: Palette documentation only; no production component contract.
---

## Overview

Frozen Brand A / Light documentation context. Source: Runtime `86e1d2a`, checked-in exports and generated CSS. Keep Brand and Scheme independent.

## Colors

Use exactly the declared colors. `primary` maps heading ink for this document; it does not define an action-primary role. Never invent tonal colors or replace brand colors to improve contrast.

## Typography

Use the declared typography; fallback is system-ui, sans-serif. No external font download. Label text must remain at least 14px. Font availability needs independent verification.

## Layout

Use page, section, gap, card-padding and inner spacing as declared. Only the task explicitly grants layout changes. Do not change content or add status claims.

## Elevation & Depth

Flat documentation cards. No shadows, gradients or decorative depth.

## Shapes

Use the declared card radius. No inferred radius scale.

## Components

No production components specified. Only documentation swatches and their supplied labels are in scope.

## Do’s and Don’ts

Preserve names, values and source aliases. Do not add dependencies or invent tokens, roles, acceptance statuses or accessibility claims. Report missing inputs. Verify output independently against this mapping.

| Projection key | Source CSS variable | Resolved value |
| --- | --- | --- |
| primary | `--uif-semantic-color-foreground-strong` | `#000000` |
| surface | `--uif-semantic-color-surface-default` | `#FFFFFF` |
| content | `--uif-semantic-color-content-default` | `#333333` |
| border | `--uif-semantic-color-border-strong-default` | `#000000` |
| green-500 | `--color-brand-a-green-500` | `#AFC36F` |
| green-700 | `--color-brand-a-green-700` | `#899E42` |
| green-900 | `--color-brand-a-green-900` | `#515D27` |
| h1.fontFamily | `--font-family-sans` | `Inter` |
| h1.fontSize | `--uif-semantic-scale-font-size-xxl` | `2rem` |
| h1.lineHeight | `--uif-semantic-scale-line-height-xxl` | `2.75rem` |
| body.fontFamily | `--font-family-sans` | `Inter` |
| body.fontSize | `--uif-semantic-scale-font-size-md` | `1rem` |
| body.lineHeight | `--uif-semantic-scale-line-height-md` | `1.5rem` |
| label.fontFamily | `--font-family-sans` | `Inter` |
| label.fontSize | `--uif-semantic-scale-font-size-sm` | `.875rem` |
| label.lineHeight | `--uif-semantic-scale-line-height-sm` | `1.25rem` |
| card | `--uif-semantic-shape-corner-panel` | `.25rem` |
| page | `--size-spacing-700` | `2rem` |
| section | `--size-spacing-600` | `1.5rem` |
| gap | `--size-spacing-400` | `1rem` |
| card-padding | `--uif-semantic-size-spacing-spacious` | `1rem` |
| inner | `--uif-semantic-size-spacing-component` | `.5rem` |
