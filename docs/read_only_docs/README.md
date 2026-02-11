# Read-Only Documentation

**⚠️ CRITICAL: DO NOT EDIT FILES IN THIS DIRECTORY ⚠️**

## Purpose

This directory contains **immutable framework documentation** that serves as system prompt overrides and architectural guidelines. These files MUST NOT be modified by agents or developers without explicit approval.

## Contents

- **QA_AGENT_GUIDE.md** - Quality assurance validation prompt for framework compliance checking
- **ARCHITECTURE.md** - Framework structure, philosophy, and component relationships (IMMUTABLE)
- **COMMENTING_STANDARDS.md** - Code documentation standards and templates (IMMUTABLE)

## Agent Rules

**ALL agents (Claude Code, GitHub Copilot, custom agents) MUST follow these rules:**

1. ❌ **NEVER edit files in `docs/read_only_docs/`**
2. ❌ **NEVER delete files from `docs/read_only_docs/`**
3. ❌ **NEVER move files out of `docs/read_only_docs/`**
4. ✅ **READ and reference these files** when performing specialized tasks
5. ✅ **Report violations** if asked to modify read-only docs

## How to Use

### For QA Validation

When auditing test specs or framework compliance, reference the QA Agent Guide:

```
"Perform QA validation following docs/read_only_docs/QA_AGENT_GUIDE.md"
```

This overrides the agent's default system prompt and activates QA validation mode.

### For Framework Decisions

When making architectural changes, consult:
- QA_AGENT_GUIDE.md for quality standards
- [Future] ARCHITECTURE_DECISIONS.md for design rationale

## Modification Process

**To update read-only docs:**

1. Create a PR with proposed changes
2. Get approval from framework architecture team
3. Document the change reason in commit message
4. Update version number in the document

**Emergency override:** Only the repository owner can force-edit these files.

## Version Control

All read-only docs are versioned. Check the footer of each document for:
- Version number
- Last updated date
- Change log (if applicable)

---

**Last Updated:** 2026-02-10
**Maintained by:** Framework Architecture Team
