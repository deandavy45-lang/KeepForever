# 01 · UX/UI research summary

> Desk research and competitive teardown, not primary user research. Validate the
> personas and the referral timing with 8–12 interviews before launch (guide at the end).

## Who we're building for

| Persona | Job to be done | What they fear | Design response |
|---|---|---|---|
| **The Family Keeper** (35–60, usually the parent who "does the photos") | Turn 20,000 camera-roll photos into something the family will actually look at | Losing photos when a phone dies; nobody knowing the stories | Story-first memories, not bulk upload. Timeline by year. Local-first, backup later |
| **The Grandparent Storyteller** (65+) | Leave the stories behind the photos | Fiddly UI, small text, being "sold to" | 16pt body, 48pt targets, Dynamic Type up to 1.8×, plain language, no dark patterns |
| **The Gift Maker** (any age, seasonal) | Make a book for a birthday, wedding, memorial | Print looking bad; layout taking hours | Auto-layout from an album in one tap, print bleed handled for them |

## What the category teaches us

| Product | Strength to borrow | Weakness to avoid |
|---|---|---|
| Google Photos / Apple Photos | Effortless capture, "Memories" resurfacing | Stories and context are an afterthought; no family ownership |
| Chatbooks | One-tap books from a feed; subscription habit | Heavy upsell, aggressive notifications |
| Storyworth | Weekly prompts produce written stories → book | Text-only, email-based, no photo vault |
| FamilySearch Memories | Free, trusted, genealogical framing | Dated UI, tied to a religious org for some users |
| Artifact Uprising / Shutterfly | Beautiful print quality | Desktop-centric editors, endless coupon pressure |
| Tinybeans | Private family sharing, high retention around kids | Ad-heavy free tier erodes trust |

**Gap For Keeps fills:** a calm, private, story-first family vault that makes print easy
and later hands the vault on, which is the natural bridge to The Keep.

## Retention loops (in priority order)

1. **Add → see it on the timeline** (instant payoff). Shipped in this build.
2. **Album → book** (a tangible output within the first session). Shipped.
3. **"On this day" resurfacing** via a local notification, opt-in, max 1/week. Next.
4. **Weekly story prompt** ("What was your first car?") for grandparents. Next.
5. **Invite family to a shared vault** (needs cloud sync). Later; schema is ready.

## UI principles used in the components

- **Warm heirloom palette** (cream, ink, terracotta) with a separate **green "legacy" tone**
  reserved only for The Keep so it never feels like a For Keeps upsell.
- Serif display type for titles (keepsake feel), system sans for body (legibility).
- Every touch target ≥ 48pt; every interactive element has an accessibility label.
- Light and dark themes from one token set (`src/core/theme/tokens.ts`).
- Empty states always explain the next step and offer one button.

## Referral to The Keep: research-backed rules

Users tolerate a cross-sell when it is **earned, relevant, labelled, and easy to refuse**.
So the bridge:

- Never appears before the user has value in the vault (≥10 memories and ≥14 days).
- Appears at moments of reflection (timeline, just after exporting a book), never mid-task.
- Is labelled "From our partner service, The Keep" and styled differently.
- Can be dismissed (60-day cooldown), retires after 2 dismissals, and can be turned off in Settings.
- Always remains discoverable from **Settings → Legacy** (user-initiated, ungated).
- Opens an explainer screen first ("what we share: nothing from your vault") before leaving the app.

## Interview guide (30 min, to validate)

1. Walk me through the last time you tried to do something with family photos.
2. Where do the *stories* behind your photos live today?
3. Show me a printed photo book you've made or received. What made it hard?
4. If you passed away tomorrow, what happens to your family photos? Who would know?
5. (Show the Keep card) What do you think this is? Would it bother you? When would it be welcome?
