---
name: Chat must never be blocked by cards/forms
description: Pipeline launch card and other forms must NEVER replace the chat conversation area. Chat input must always work. Cards should be overlays/modals or inline alongside messages, not view replacements.
type: feedback
---

Chat must never be blocked by inline cards, forms, or panels that replace the conversation view.

**Why:** The PipelineLaunchCard uses `view === 'launch'` to replace the entire chat content area. User can't chat, can't dismiss the card, can't go back without starting a pipeline. This is a recurring pattern — any `view` state that replaces chat messages breaks the conversational UX.

**How to apply:**
- Never use `setView('something')` to replace chat messages with a form/card
- Pipeline launch, approval, triage, setup — all should be either:
  - A **modal/overlay** (chat visible behind it, closeable)
  - An **inline card** that appears IN the message stream (like a chat bubble) with a close/dismiss button
  - A **sidebar panel** alongside chat
- The chat input must ALWAYS be functional — user should be able to type and send messages regardless of what cards are showing
- This applies to ALL future components: never block the chat with a view switch
- Pattern to watch: `setView('X')` in ChatPage.tsx — every view state is a potential chat-blocking bug
