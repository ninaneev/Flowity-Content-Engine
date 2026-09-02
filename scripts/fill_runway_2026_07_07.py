#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Runway fill 2026-07-07: re-date existing revised posts + insert new dailies/newsletters.

Idempotent: inserts skip any hook already present; re-dates are plain UPDATEs by id.
Batch marker: content-engine-batch:2026-07-07-runway-fill
"""
import os
import shutil
import sqlite3
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.path.join(ROOT, "backend", "flowity.db")
BAK = os.path.join(ROOT, "backend", "flowity.db.bak-20260707")

BATCH = "content-engine-batch:2026-07-07-runway-fill"

# Airtable Content Queue already covers these dates (Jul 7 is outside window; 11/18 are Saturdays)
AIRTABLE_WEEKDAYS = {"2026-07-09", "2026-07-14"}

WINDOW_START = date(2026, 7, 8)
WINDOW_END = date(2026, 9, 8)

# ---------------------------------------------------------------- re-dates
REDATES = {
    1: "2026-07-08 09:00:00",   # linkedin daily
    2: "2026-07-10 09:00:00",
    3: "2026-07-13 09:00:00",
    4: "2026-07-15 09:00:00",
    5: "2026-07-12 09:00:00",   # newsletter -> Sunday
    6: "2026-07-16 09:00:00",
    7: "2026-07-17 09:00:00",
    8: "2026-07-20 09:00:00",
    9: "2026-07-21 09:00:00",
    10: "2026-07-19 09:00:00",  # newsletter -> Sunday
}

# ---------------------------------------------------------------- new posts
def daily(d, pillar, hook, body, cta, short_x, alt_title, tone, objective):
    return dict(date=d + " 09:00:00", channel="linkedin", fmt="linkedin-post + matching-x",
                pillar=pillar, hook=hook, body=body, cta=cta, short_x=short_x,
                alt_title=alt_title, tone=tone, objective=objective, issue=None)


def newsletter(d, pillar, issue, hook, body, cta, short_x, alt_title):
    return dict(date=d + " 09:00:00", channel="newsletter", fmt="newsletter-anchor",
                pillar=pillar, hook=hook, body=body, cta=cta, short_x=short_x,
                alt_title=alt_title, tone="newsletter / sharp / grounded",
                objective="publish weekly newsletter and build signal-literacy audience",
                issue=issue)


POSTS = [

# ================= WEEK 3 (Jul 20-26) — Customer signals =================

daily("2026-07-22", "customer-signals",
"Your best customer just asked a question that sounds like curiosity. It was a buying signal.",
"""\"How do you handle multiple workspaces?\"
\"Does this work if the team doubles?\"
\"Who else do you work with in our space?\"

None of these are support questions.
They are a customer imagining a bigger version of the relationship — and checking whether you can hold it.

Most founders answer the literal question and move on. Ticket closed, response time logged, everyone efficient.

The expansion conversation never happens, because nobody noticed it had already started.

Here is the shift: every question has two layers. What they asked, and why now.

The second layer is where revenue lives.

Next time a customer asks about scale, integrations, or your roadmap — don't just answer. Ask what's changing on their side.

You'll close expansion you didn't know was open.

Call it.""",
"What question did a customer ask you this week that might have a second layer?",
"Customers signal expansion as casual questions. 'Does this work if the team doubles?' is not curiosity. Answer the second layer, not just the first.",
"Buying signals hide inside support questions",
"direct / practical", "teach founders to read expansion signals in routine questions"),

daily("2026-07-23", "customer-signals",
"A quiet account is not a stable account.",
"""No tickets. No complaints. No feature requests. Renewal is months away.
It feels like your healthiest customer.

Half the time, it's your most at-risk one.

Silence has two very different meanings:
The product works so well they never think about you.
Or the product matters so little they never think about you.

From the outside, those look identical.
From the inside, one renews and one quietly evaluates your competitor.

The test is not activity. It's initiative.
When did they last start a conversation? Ask a question that looks forward? Mention a plan that includes you in it?

If every touchpoint in the last quarter was started by you, the silence is not satisfaction. It's distance.

Distance is recoverable — but only while it's still distance.

Call it.""",
"Which account went quiet on you — and which kind of quiet do you think it is?",
"A quiet account is not a stable account. Silence means 'works so well I forgot you' or 'matters so little I forgot you.' Same look, opposite renewals.",
"Two kinds of customer silence",
"sharp / teaching", "reframe account silence as a signal to be read, not comfort"),

daily("2026-07-24", "customer-signals",
"The feedback you act on fastest is the loudest. That's the problem.",
"""The angry email gets a same-day fix.
The public complaint gets a call from the founder.
The churn threat gets a discount.

Meanwhile the pattern — the thing five customers mentioned mildly, in passing, without heat — sits unread across five separate conversations.

Loud feedback tells you about one customer's worst day.
Quiet, repeated feedback tells you about your product.

One founder I know keeps a single note called \"said twice.\" Any comment a second customer repeats, in any wording, goes in. That's the whole system.

Three of her last four product decisions came from that note. None of them came from an escalation.

Volume is not importance. Repetition is.

Call it.""",
"What's the mild comment you've now heard more than once?",
"Loud feedback tells you about one customer's worst day. Quiet repeated feedback tells you about your product. Track 'said twice,' not 'said loudly.'",
"Repetition beats volume in customer feedback",
"contrarian / practical", "give founders the said-twice note as a minimal feedback system"),

newsletter("2026-07-26", "customer-signals", 7,
"Newsletter: Your customers answer questions you never asked. Are you reading those answers?",
"""Call It! — Issue #7
Pillar: Customer signals

Every survey you send collects answers to your questions.
Every day, your customers generate answers to questions you never asked.

Which feature confused them — answered by where they stalled.
Whether they'd renew — answered by who joined the last call.
What they actually bought you for — answered by the one workflow they use every single day while ignoring the rest.

Most founders are fluent in the first kind of answer and illiterate in the second. Not because they don't care. Because asked-for feedback arrives formatted — a score, a form, a thread — and unasked-for feedback arrives as behavior, scattered across tools, visible only if someone connects it.

---

THE THREE UNASKED QUESTIONS

1. What do they do right after something breaks?
A customer who files a ticket is invested. A customer who finds a workaround and doesn't tell you has started needing you less. Workarounds are churn in beta.

2. Who is in the room?
When a champion starts bringing a colleague to calls, they're building internal support — that's an expansion signal. When a champion disappears and a procurement-flavored contact appears, the relationship is being priced, not deepened.

3. What do they ignore?
The features nobody touches aren't roadmap trivia. They're a map of the gap between the product you think you sold and the product they actually bought. Renewal lives inside that gap.

---

HOW TO READ WITHOUT A TOOL

You don't need software for this. You need a habit.

Once a week, pick your top ten accounts and answer three questions from memory: who initiated our last contact, what did they last ask that looked forward, what have they stopped doing.

Where memory fails, that's a finding too — it means nobody is holding that account's story, and unheld stories are where surprises come from.

Write one sentence per account. Twenty minutes. What you're building is not a report. It's the capacity to notice change — and change, not state, is where every customer signal lives.

The dashboard tells you where an account is. The story tells you where it's going.

---

ONE READER'S RESULT

A reader ran the \"said twice\" note from this week's posts and found the same integration request from four customers across three months — phrased four different ways, logged zero times.

Four voices. One signal. No record.

That's not a data problem. It's a reading problem — and reading problems are fixable this week, with what you already have.

Call it.""",
"Reply with the unasked question your customers have been answering. I read every one.",
"Your customers answer questions you never asked — in behavior, not surveys. Issue 7 of Call It: the three unasked questions and how to read them without a tool.",
"Call It! Issue 7 — The questions you never asked"),

# ================= WEEK 4 (Jul 27-Aug 2) — Self-signals =================

daily("2026-07-27", "self-signals",
"You've rewritten that email four times. That's not perfectionism. That's a signal.",
"""Four drafts means some part of you doesn't believe what you're saying.

Maybe the price is wrong and you know it.
Maybe you're promising a deadline you can't hit.
Maybe you don't want this client at all.

The email isn't hard to write. The truth under it is hard to send.

Watch where friction shows up in your own output. The proposal that takes three days. The invoice you \"keep forgetting.\" The follow-up you'll do \"after lunch\" for a week.

Friction is your judgment speaking before you've let it use words.

You can override it — sometimes you should. But override it consciously, after hearing it out.

What you feel while doing the work is information about the work.

Call it.""",
"What have you rewritten four times lately — and what's the sentence you're avoiding?",
"Four drafts of one email is not perfectionism. It's a part of you that doesn't believe what you're saying. Read the friction before you push through it.",
"Friction in your own output is a signal",
"sharp / introspective", "teach founders to read their own work friction as data"),

daily("2026-07-28", "self-signals",
"The task you keep moving to next week has already answered your question.",
"""Six Mondays in a row. Same task. Same migration to next week.

Founders call this a discipline problem and buy a new productivity system.
It's usually a signal problem.

A task that keeps sliding is telling you one of two things:
It matters and it scares you. Or it doesn't matter and you can't admit that yet.

The fix is different for each — courage for the first, deletion for the second — but the diagnosis is the same move: notice what you feel when you look at it.

Dread means it's important. Do it first, tomorrow, before anything else.
Indifference means it's dead. Delete it and watch how little happens.

What you must not do is move it a seventh time. Every migration teaches you to stop trusting your own list.

Call it.""",
"What's the task that's survived six Mondays on your list — dread or indifference?",
"The task you keep postponing has already answered your question. Dread means do it first. Indifference means delete it. A seventh migration teaches you to distrust your own list.",
"Procrastination is information",
"direct / practical", "reframe chronic postponement as a readable signal"),

daily("2026-07-29", "self-signals",
"Founders track every metric except the one they operate on: their own energy.",
"""You know your MRR to the euro. Your churn to the decimal.
Do you know what time of day your judgment is sharpest?

You are the production system. Every decision, every price, every hire runs through your state at the moment you made it.

An underslept founder doesn't make bad decisions randomly. They make a specific kind: short-term, conflict-avoidant, discount-happy.

I started logging one line a day — energy 1 to 5, one word why. Thirty days later the pattern was embarrassing: every decision I regretted that month was made on a 2.

Now low-energy days have a rule: no pricing, no hiring, no strategy. Just execution.

The business didn't slow down. The regret rate did.

Call it.""",
"Do you know your own 2-out-of-5 pattern? What kind of decisions do you make on those days?",
"You know your MRR to the euro but not what time of day your judgment is sharpest. Log energy 1-5 daily for a month. Your regretted decisions will cluster. Mine did.",
"The energy ledger — one line a day",
"personal / practical", "introduce the daily energy log as founder instrumentation"),

daily("2026-07-30", "self-signals",
"The decision you're 'still thinking about' was made weeks ago.",
"""You know. You've known for a while.

The hire isn't working. The partnership is one-sided. The price is too low.

\"Still thinking about it\" is rarely thinking. It's scheduling — negotiating the date you'll act on a conclusion you've already reached.

Here's the test. Imagine someone made the decision for you, tonight, irreversibly.
If the first thing you feel is relief — you decided long ago.

The cost of the gap between deciding and acting is not neutral. Every week you carry a made-but-unexecuted decision, it taxes everything else: your attention, your energy, your other calls.

Founders think the risk is deciding wrong.
More often, the damage comes from deciding right — slowly.

Call it.""",
"What's on your 'still thinking about it' list that already has an answer?",
"'Still thinking about it' is rarely thinking. It's scheduling. The relief test: if the decision were made for you tonight and you'd feel relief, you already decided.",
"The relief test for stuck decisions",
"sharp / direct", "give founders the relief test for unexecuted decisions"),

daily("2026-07-31", "self-signals",
"You don't dread the client. You dread who you become around the client.",
"""There's a name in your inbox that changes your posture.

You get smaller. More formal. You over-explain. You quote lower than you planned and say yes to scope you'd decline anywhere else.

The easy read is \"difficult client.\" Sometimes true.

The more useful read: something about this relationship switches you out of your own judgment. An old script — the boss, the parent, the teacher. You're not negotiating with the client. You're negotiating with the pattern.

Test it: write the email you'd send if a calmer, better-resourced founder ran your company. Compare it to the one you were about to send.

The gap between those two emails is the real cost of the account — and it never shows up on the invoice.

Some clients are priced in money. Others are priced in who you have to become.

Call it.""",
"Which name in your inbox changes your posture — and what's the pattern it triggers?",
"You don't dread the client. You dread who you become around them. Write the email a calmer founder would send, compare it to yours. The gap is the account's real price.",
"Some clients are priced in who you become",
"empathetic / introspective", "surface relationship patterns that distort founder judgment"),

newsletter("2026-08-02", "self-signals", 8,
"Newsletter: You are the instrument your business is measured with. When did you last calibrate it?",
"""Call It! — Issue #8
Pillar: Self-signals

Every signal this newsletter has ever covered — the quiet account, the early churn, the deal going cold — reaches you through the same sensor: your attention, your energy, your judgment on the day the signal arrived.

An out-of-calibration instrument doesn't fail loudly. It keeps producing readings. They're just wrong — and they look exactly like the right ones.

---

HOW FOUNDERS DRIFT

Drift is not dramatic. It's three small mechanisms.

Fatigue narrows. Tired founders don't make random errors — they make a specific kind: short-term over long-term, avoidance over conflict, discounts over conviction. The judgment feels normal from the inside. It always does.

Load deafens. Past a certain volume of inputs, you stop reading signals and start triaging noise. The mild-but-repeated customer comment loses to the loud one. The important-but-quiet task loses to the urgent one. Nothing important gets read at exactly the moment everything important is happening.

Story overwrites. Whatever narrative you're carrying — \"we have momentum,\" \"this hire will work out\" — quietly edits incoming evidence to fit. The stronger the story, the later the correction.

---

THREE CALIBRATION CHECKS

Each takes minutes. Together they're a maintenance schedule for the instrument.

1. The energy ledger. One line per day: energy 1-5, one word why. After thirty days, cross-reference against your decisions. Most founders find their regretted calls cluster on the low-energy days — which turns \"I'm tired\" from a complaint into a trading rule: no pricing, no hiring, no strategy on a 2.

2. The relief test. For any decision you're \"still thinking about\": imagine it's been made for you, irreversibly, tonight. If the first feeling is relief, you already decided — you're just scheduling. Count how many made-but-unexecuted decisions you're carrying. Each one taxes every other call you make.

3. The friction audit. List what you rewrote, postponed, or \"kept forgetting\" this week. Friction in your own output is judgment speaking before it uses words — the proposal you can't finish is usually a price you don't believe or a client you don't want. Read the friction before you push through it.

---

THE WEEKLY VERSION

Sunday evening or Monday morning. Fifteen minutes. Three questions:

What changed in me this week?
What am I avoiding, and what is the avoidance about?
Where might my current story be editing the evidence?

Write three sentences. That's the whole ritual.

You review your accounts weekly. You are the account everything else depends on.

Calibrated founders don't feel more certain. They know how certain they are — which is rarer, and worth more.

Call it.""",
"Reply with two things: your energy number today, and the one word why. I read every one.",
"You are the instrument your business is measured with. Issue 8 of Call It: how founder judgment drifts, and three calibration checks that take minutes.",
"Call It! Issue 8 — Calibrating the instrument"),

# ================= WEEK 5 (Aug 3-9) — AI leverage =================

daily("2026-08-03", "ai-leverage",
"AI won't tell you anything new about your business. That's exactly why it's useful.",
"""Everything AI surfaces from your data was already there.
The churn pattern. The repeated objection. The price sensitivity.

You're not paying for new information. You're paying for retrieval speed on information you collected and never read.

That reframe matters, because founders keep waiting for AI to be smart before they use it. It doesn't need to be smart. It needs to be thorough — and it already is.

You read your last fifteen client conversations once each, weeks apart, in the mood of that day.
AI reads them all at once, this morning, with no memory of which client annoyed you.

Same data. Different reader. The second one sees patterns because it isn't inside them.

The founders getting leverage aren't asking AI to think for them.
They're asking it to read what they lived through too closely to see.

Call it.""",
"What data have you collected but never actually read end to end?",
"AI won't tell you anything new about your business. That's the point. You're paying for retrieval speed on data you collected and never read. Distance, not intelligence.",
"AI is a reader, not an oracle",
"sharp / reframing", "position AI as signal reader rather than answer machine"),

daily("2026-08-04", "ai-leverage",
"Paste your last ten client emails into an AI. Ask one question: what am I not seeing?",
"""That's it. That's the workflow.

No integration. No tool stack. No prompt engineering course.

Ten real emails — the actual back-and-forth, not your summary of it — and one honest question.

The first time I did this, it flagged something I'd have sworn wasn't there: I apologize before delivering good news. \"Sorry for the delay — the feature shipped.\" \"Apologies, quick update — the numbers are up.\"

Every client email. A reflex I couldn't see because I wrote it.

It also noticed a client whose replies had shrunk from paragraphs to single lines over six weeks. I'd registered nothing. The relationship was cooling one sentence at a time.

Neither insight required intelligence. They required distance — the one thing you can't have from your own inbox.

Ninety seconds. Real data. One question.

Call it.""",
"If you run it, tell me what surfaced. The reflex you can't see is the interesting part.",
"Paste your last ten client emails into AI. Ask: what am I not seeing? Mine found I apologize before good news — in every single email. Distance you can't get from your own inbox.",
"The 90-second inbox read",
"personal / practical", "give one immediately runnable AI exercise"),

daily("2026-08-05", "ai-leverage",
"The best AI workflow I know fits in one sentence.",
"""\"Every Friday, feed the week's customer conversations to AI and ask what changed.\"

That's the whole system.

Not what happened — what changed. The distinction does all the work.

\"What happened\" returns a summary. You already lived the week; you don't need it recited.

\"What changed\" returns deltas. A client who asks shorter questions than last month. A prospect who moved from \"how does it work\" to \"how do we start.\" A support theme that appeared twice this week and zero times before.

Change is where signals live. State is where dashboards live.

Your dashboard can tell you usage is at 60%. Only a reader — human or machine — can tell you it was 80% for a year and started sliding in June.

One sentence, once a week. The habit matters more than the model.

Call it.""",
"What would 'what changed this week' surface from your last five customer conversations?",
"The best AI workflow fits in one sentence: every Friday, feed the week's conversations to AI and ask what changed. Not what happened. Change is where signals live.",
"Ask for deltas, not summaries",
"direct / teaching", "teach the what-changed question as the core weekly habit"),

daily("2026-08-06", "ai-leverage",
"You don't need an AI strategy. You need one AI habit.",
"""Founders keep asking what their AI strategy should be.

Wrong altitude. Strategy is for things you'll do in a year. AI leverage comes from something you do every week.

Pick one recurring pile of unread signal — support threads, sales notes, cancellation reasons.
Pick one recurring moment — Friday afternoon, Monday coffee.
Pick one question — what pattern am I missing? What changed? What are customers asking for that they're not getting?

Pile, moment, question. Run it weekly for a month before you add anything.

Most founders do the opposite: seventeen tools, no ritual. They have AI access and no AI habit — a gym membership and no gym.

The compounding is in the repetition. Week one is interesting. Week six is when the same signal shows up twice and you catch a trend while it's still forming.

Call it.""",
"What's your one pile, one moment, one question?",
"You don't need an AI strategy. You need one AI habit: one pile of unread signal, one weekly moment, one question. Repetition is where the compounding lives.",
"Pile, moment, question",
"contrarian / practical", "replace AI strategy anxiety with a single weekly habit"),

daily("2026-08-07", "ai-leverage",
"Most founders ask AI for answers. The leverage is in asking for patterns.",
"""\"Should I raise prices?\" is a bad AI question. It hands the decision away.

\"Here are twelve deals from this quarter — what did the closed ones have in common that the lost ones didn't?\" is a great one. It keeps the judgment and delegates the reading.

The difference is what you're outsourcing.

Answers require context AI doesn't have: your runway, your appetite, your ambition.
Patterns require attention you don't have: fifty documents, read simultaneously, without ego.

Give it what it's good at.

Pattern questions to steal:
What do these customers have in common?
What phrase keeps appearing before deals stall?
Where do my assumptions and this data disagree?

Then decide yourself — with a read you couldn't have gotten alone.

AI as oracle makes you smaller. AI as reader makes you sharper.

Call it.""",
"What decision are you asking AI to make that it should only be informing?",
"'Should I raise prices?' hands the decision away. 'What did closed deals have in common that lost ones didn't?' keeps judgment, delegates reading. Ask AI for patterns, not answers.",
"Patterns in, decisions yours",
"sharp / teaching", "teach the answers-vs-patterns distinction in AI prompting"),

newsletter("2026-08-09", "ai-leverage", 9,
"Newsletter: One founder, one hour a week, one AI reading everything. The weekly signal review.",
"""Call It! — Issue #9
Pillar: AI leverage for solo founders

One founder. One hour a week. One AI reading everything you didn't have time to.

That's the whole system this issue teaches. No stack, no subscriptions beyond a model with a long context window, no dashboard. A ritual.

---

WHY A RITUAL BEATS A TOOL

Tools promise continuous monitoring and mostly deliver continuous ignoring — one more dashboard nobody opens. What actually compounds is a fixed weekly moment where everything gets read at once.

Reading in batch is the trick. Signals are invisible one conversation at a time; they only exist across conversations. The customer who asked about integrations once is trivia. Four customers in three weeks is a roadmap decision. You can't see the second thing in real time. You can see it every Friday.

---

THE HOUR, STEP BY STEP

Collect — 10 minutes. Dump the week into one file: customer emails, call notes, support threads, cancellation messages, plus your own one-sentence note about how the week felt. Raw, unedited, chronological. Don't summarize first — summaries are where signals go to die.

Ask — 20 minutes. Three questions, in this order:

What changed compared to previous weeks? Deltas, not summaries. Shorter replies from a client. A prospect's questions shifting from how-it-works to how-we-start.

What repeats that I haven't acted on? The said-twice list. Anything appearing twice this week, or across the last month, in any wording.

Where does this data disagree with what I believe? Paste your current assumptions and let it argue. This is the question founders skip — and the one that pays for the hour.

Record — 10 minutes. One page: three findings, one sentence each, dated. The archive matters more than any single week. Six dated pages is a trend detector no tool sells.

Act — 20 minutes. One move, immediately, before the hour ends: the check-in email, the price test, the question to the quiet account. A reading habit with no acting habit is just anxiety with better formatting.

---

WHAT SHOWS UP

Week one is usually humbling — obvious things you missed. Weeks two through four are calibration: you learn which findings are real and which are noise. Week six is where it turns. The same signal appears twice, and for the first time you catch a trend while it's still a trend and not an outcome.

Founders keep waiting for the AI feature that will watch their business for them. Meanwhile the version that works costs one hour and exists today, with the tools you already have open in a browser tab.

The hour is the tool.

Call it.""",
"Reply with the word 'hour' and I'll send you the three questions formatted to paste. I read every reply.",
"One founder, one hour a week, one AI reading everything. Issue 9 of Call It: the weekly signal review — collect, ask, record, act.",
"Call It! Issue 9 — The weekly signal review"),

# ================= WEEK 6 (Aug 10-16) — Women building differently =================

daily("2026-08-10", "women-building-differently",
"She was told to sound more confident. She was already the most accurate person in the room.",
"""A founder I know hedges when she speaks.
\"I might be wrong, but the churn looks early-stage.\"
\"This could be nothing — the champion's gone quiet.\"

Her advisors told her to sound more confident. Standard advice.

Then someone checked her track record. The hedged calls were right far more often than the confident declarations of the people telling her to speak like them.

Her hedging wasn't insecurity. It was precision — she was reporting her actual confidence level, calibrated, like a good forecaster.

The room rewarded volume and called it leadership.

There's a difference between sounding sure and being right, and most rooms are tuned to detect only the first.

If you hedge because you're calibrated, keep the calibration. Change the framing if you must: \"My confidence here is 70%, and here's why.\"

Accuracy is the asset. Delivery is negotiable.

Call it.""",
"Whose quiet, hedged read do you trust more than the loudest voice in your room?",
"She was told to sound more confident. Her hedged calls were right more often than the confident people advising her. Hedging isn't insecurity. Sometimes it's calibration.",
"Calibration is not insecurity",
"sharp / story", "defend calibrated speech against confidence theater"),

daily("2026-08-11", "women-building-differently",
"'I just had a feeling' is data you haven't formatted yet.",
"""Every founder has a story that ends \"something felt off, and I ignored it.\"

The hire whose references were perfect but the coffee chat felt rehearsed.
The client who agreed to everything a little too fast.
The partner whose enthusiasm never converted into a single completed task.

We call it a feeling because it arrives without a spreadsheet. But look closer and it's pattern recognition running on data you absolutely collected: tone, response latency, the gap between words and behavior.

You noticed. You just couldn't cite your sources, so you overruled yourself.

Try this: next time something feels off, don't act on it — document it. One sentence: what I noticed, what I predict. Date it.

Three months of those sentences is a calibration record. Most founders discover their feelings have a better hit rate than their reasoning ever gave them credit for.

Trust is earned. Let your own reads earn it — on paper.

Call it.""",
"What did you notice, overrule, and later regret overruling?",
"'I just had a feeling' is pattern recognition without citations. Stop overruling it and start documenting it: one dated sentence — what I noticed, what I predict. Build the track record.",
"Format your feelings into a track record",
"empathetic / practical", "turn founder intuition into a documented calibration record"),

daily("2026-08-12", "women-building-differently",
"The advice was 'be more strategic.' The signal was: her strategy just didn't look like theirs.",
"""She made decisions by talking to customers until something clicked.
Her advisors wanted frameworks, memos, a two-by-two.

So she learned to translate. Decide the way she decides — through conversation, pattern, and read — then reverse-engineer a slide that made the decision look like it came from a matrix.

The decisions were good. The slides were theater.

Years in, she stopped making the slides. Just wrote: \"I've talked to thirty customers this quarter. Here's what I keep hearing. Here's my call.\"

The quality of decisions didn't change. The energy spent legitimizing them dropped to zero.

There's a real difference between rigor and costume. Rigor is doing the work — hers was thirty conversations. Costume is formatting the work to look like someone else's process.

Keep the rigor. Drop the costume.

Call it.""",
"What part of your decision process is real rigor — and what part is costume for an audience?",
"She decided through thirty customer conversations, then built slides to make it look like a matrix. The decisions were rigorous. The slides were costume. Keep the rigor, drop the costume.",
"Rigor vs costume",
"story / sharp", "separate genuine decision rigor from performative process"),

daily("2026-08-13", "women-building-differently",
"Consensus is a comfort metric.",
"""Everyone agreed with the plan. That's what worried her.

Full agreement usually means one of three things:
The decision is trivial. The room is homogeneous. Or people have learned that disagreeing with you is expensive.

Only the first is good news.

She started tracking a different signal: time-to-first-objection. In a healthy discussion, someone pushes back inside five minutes. When a big decision sails through untouched, she now pauses it — not because it's wrong, but because it's unexamined.

Her move: assign the pushback. \"Before we commit, someone argue the other side like they mean it.\" Rotating, explicit, safe.

The point isn't conflict. It's that agreement you engineered comforts you, and agreement you tested informs you.

If nobody around you ever says no, you're not leading. You're echoing.

Call it.""",
"How long has it been since someone in your orbit genuinely pushed back on a plan of yours?",
"Everyone agreed with the plan. That's the worrying part. Track time-to-first-objection: a big decision that sails through untouched isn't right, it's unexamined.",
"Time-to-first-objection",
"contrarian / direct", "make untested agreement legible as a risk signal"),

daily("2026-08-14", "women-building-differently",
"She didn't scale the company by trusting the process. She scaled it by trusting her read.",
"""Growth advice is process-shaped: playbooks, funnels, delegation, SOPs.

Useful. But watch what actually happens at decision time in small companies — the process narrows the options, and a person's read picks one.

For years she treated her read as the unreliable part, the thing to eliminate with better process. Then she audited a year of calls. The process-pure decisions were average. The best ones all had the same shape: data narrowed it to three options, and her read — of the customer, the moment, the team — chose the outlier.

So she stopped apologizing for it and started training it. More direct customer contact as the company grew, not less. Every delegation plan kept one thing un-delegated: her exposure to raw signal.

Scale the operations. Never outsource the read.

Call it.""",
"As you grow, what raw signal are you accidentally delegating away from yourself?",
"She audited a year of decisions. The process-pure ones were average. The best ones were data narrowing to three options and her read picking the outlier. Scale operations. Never outsource the read.",
"Scale the ops, keep the read",
"story / teaching", "protect founder signal exposure through growth"),

newsletter("2026-08-16", "women-building-differently", 10,
"Newsletter: Deferring is expensive. Here's the invoice.",
"""Call It! — Issue #10
Pillar: Women building differently

Not deferring as in politeness. Deferring as in the operating habit: treating your own read as the draft and someone else's framework as the final version.

Many founders run this way for years — and women founders are coached into it with unusual consistency. Sound more confident. Be more strategic. Get more data.

The advice is rarely about accuracy. It's about format.

---

LINE ITEMS

The translation tax. A founder decides through thirty customer conversations, then spends two days reverse-engineering a two-by-two so the decision looks like it came from a matrix. The decision was rigorous; the slide is costume. Hours spent legitimizing good judgment to an audience that mistakes format for rigor — every month, forever. The biggest line on the invoice.

The calibration discount. Hedged speech — \"I might be wrong, but\" — gets read as insecurity even when the track record says it's precision. Rooms tuned for volume promote confident inaccuracy over calibrated accuracy, and everyone pays: the founder in credibility, the room in wrong calls delivered smoothly.

The overruled read. Every founder has one: the hire that felt rehearsed, the partner whose enthusiasm never became a completed task. You noticed. You couldn't cite sources, so you overruled yourself. The cost arrived three months later, with interest.

---

PAYING LESS

Keep the rigor, drop the costume. Write the decision memo in your native process: \"I've talked to thirty customers. Here's what I keep hearing. Here's my call.\" If the work is real, the format can be yours.

Report confidence instead of performing it. Rather than flattening your calibration into fake certainty: \"I'm at 70% on this, and here's what would move me.\" You keep the precision and translate it into language the room can't misread as doubt.

Put your reads on paper. Every \"something feels off\" gets one dated sentence: what I noticed, what I predict. Three months of these is a track record — and a track record converts \"just a feeling\" into the most credible instrument in the building: a calibrated one.

---

THE LENS, NOT THE BANNER

None of this is about building softer, or about building for an audience of one gender. It's about refusing to launder your judgment through someone else's process until it stops being yours.

The founders who compound are the ones who kept custody of their own read while everyone around them was outsourcing theirs. The read is trainable, documentable, and defensible — but only if you stop treating it as the thing to apologize for.

Your read got you here. Stop paying rent to make it look like someone else's.

Call it.""",
"Reply with the last decision you translated into someone else's format. What did the translation cost you?",
"Deferring is expensive: the translation tax, the calibration discount, the overruled read. Issue 10 of Call It — the invoice, and how to pay less.",
"Call It! Issue 10 — The cost of deferring"),

# ================= WEEK 7 (Aug 17-23) — Customer signals =================

daily("2026-08-17", "customer-signals",
"Your onboarding didn't fail last week. It failed on day three.",
"""The customer who churned at day 60 usually decided by day 10.

Look at the timeline backwards:
Day 60 — cancels. Day 45 — stops logging in. Day 30 — misses the check-in call. Day 10 — asked one question, got a docs link, never asked again.

The cancellation is the last event, and it's the only one that got attention.

Day-three signals worth watching:
Did they complete the one action your product exists for — or just the setup checklist?
Did the person who bought bring anyone else in?
Did their questions get more specific — or stop?

Specific questions mean they're building. Silence after one brush-off means they're deciding.

The window where onboarding can be saved is measured in days. The window where you notice it failed is usually measured in months.

Close that gap and churn stops surprising you.

Call it.""",
"What does day three actually look like for your newest customer right now?",
"The customer who churned at day 60 decided by day 10. Watch day three: did they do the one thing your product exists for, or just the setup checklist?",
"Onboarding fails on day three",
"direct / teaching", "move churn attention from cancellation to the first week"),

daily("2026-08-18", "customer-signals",
"Renewal season doesn't start 30 days before the date. It started the day after they signed.",
"""Every renewal conversation is a verdict on a year of small moments.

The QBR that got rescheduled twice — by you.
The bug that got fixed with no follow-up on whether the fix held.
The expansion question in March that got a \"great idea, let's revisit.\"

By the time procurement asks for the renewal call, the decision has usually been made by people you haven't spoken to, based on moments you don't remember.

The read that matters: at renewal minus 90, can your champion tell the value story without your help? Not \"do they like you\" — can they defend the line item to their CFO in their own words?

If they can't, no deck you build in the final month will do it for them.

Renewals aren't won in renewal season. They're won in ordinary weeks — like this one.

Call it.""",
"Could your most important champion defend your line item today, without you in the room?",
"By the time procurement books the renewal call, the decision was made by people you haven't met, from moments you don't remember. Renewal minus 90: can your champion tell the story without you?",
"Renewals are won in ordinary weeks",
"sharp / practical", "install the renewal-minus-90 champion test"),

daily("2026-08-19", "customer-signals",
"The customer who complains is not your problem. The one who stopped complaining is.",
"""A complaint is an investment. It costs the customer effort, and people don't invest effort in things they've given up on.

The complainer believes you'll fix it. The silent one has stopped believing — or stopped caring whether you do.

Watch the sequence, not the event:
Month one: detailed bug reports, feature requests, strong opinions about your roadmap.
Month four: \"no worries, we found a workaround.\"
Month seven: nothing.

Most dashboards read that as improving health — ticket volume down, sentiment neutral.

It's the opposite. It's disengagement wearing the costume of satisfaction.

The recovery move is not a survey. It's a person: \"You used to push us hard on the product. What changed?\"

Asked honestly, that question reopens more accounts than any win-back discount.

Call it.""",
"Which customer used to push you hard — and has gone polite?",
"A complaint is an investment. The complainer still believes you'll fix it. The customer who stopped complaining stopped believing. Falling ticket volume can be disengagement in costume.",
"When complaints stop, worry",
"contrarian / teaching", "reframe declining complaints as a churn signal"),

daily("2026-08-20", "customer-signals",
"Usage went up. Value went down. Your dashboard can't tell the difference.",
"""Logins up. Session time up. Feature adoption steady. Renewal declined.

How?

Because usage measures presence, not progress. And some of the highest-usage accounts are high-usage precisely because something is wrong.

They're in the product daily — fighting it. Long sessions because the workflow takes too many steps. Heavy exports because the real work happens in a spreadsheet after they leave.

Meanwhile a low-usage account logs in twice a month, pulls the one number they built their Monday meeting around, and renews without a call. Fifteen minutes of usage. Total dependence.

The question is never \"how much do they use it?\" It's \"what breaks in their week if it disappears?\"

You can't dashboard that. You can ask it: \"Walk me through what you did with us last week — and what it fed into.\"

The answer is a renewal forecast.

Call it.""",
"For your top account: what actually breaks in their week if your product vanishes?",
"Usage measures presence, not progress. Some accounts are high-usage because they're fighting the product. The real question: what breaks in their week if you disappear?",
"Presence is not progress",
"sharp / reframing", "break the usage-equals-health assumption"),

daily("2026-08-21", "customer-signals",
"Every churned customer gave you an exit interview. Most of it happened before they left.",
"""The cancellation survey says \"switching to another solution.\" Useless.

But scroll back through the relationship and the real exit interview is all there, timestamped:

The February ticket asking if you integrate with the tool they eventually left you for.
The April call where they asked about pricing tiers — down, not up.
The June email from a new contact \"taking over\" the account.

They told you everything. Not in one document — in a trail.

This week's practice: take your last three churned accounts and read the final 90 days of each, end to end, in order. One hour total.

You're not looking for what went wrong — you know that. You're looking for the earliest moment you could have known. That moment is your new alarm.

Churn autopsies aren't about the dead account. They're about the live ones showing the same first symptom.

Call it.""",
"Have you ever read a churned account's last 90 days end to end? What was the earliest tell?",
"Every churned customer gave you an exit interview — scattered across 90 days of tickets, calls, and emails. Read three of them end to end. Find the earliest tell. That's your new alarm.",
"The exit interview you already have",
"direct / practical", "turn churn autopsies into early-warning alarms"),

newsletter("2026-08-23", "customer-signals", 11,
"Newsletter: Your customer listening system is one person's memory. That's the risk.",
"""Call It! — Issue #11
Pillar: Customer signals

Ask a founder how they track customer signals and the honest answer is usually: I remember things.

The February integration request, the champion who went quiet, the odd pricing question in April — all of it lives in one founder's head, retrieved by luck at decision time.

Memory is a terrible signal store. It over-weights the recent and the loud, silently drops the mild-but-repeated, and rewrites itself to fit whatever story you're currently telling.

This issue is the minimum viable replacement. Three components, all free.

---

COMPONENT ONE: THE SAID-TWICE NOTE

One note. Any comment a second customer repeats — in any wording — goes in, dated. That's the entire spec.

Repetition is the strongest signal in a small company, and it's precisely what memory loses: the two mentions arrive weeks apart, in different channels, in different moods. On paper, they find each other.

Review it monthly. Anything with three entries is a decision waiting to be made.

---

COMPONENT TWO: THE ACCOUNT STORY LINE

Weekly, for your top ten accounts, one sentence each, built from three prompts: who initiated our last contact, what did they last ask that looked forward, what have they stopped doing.

Where you can't answer from memory — that's a finding. It means no one holds that account's story, and unheld stories are where surprises come from.

Twenty minutes. You're not building a report; you're building the capacity to notice change. Change, not state, is where every signal in this series has lived.

---

COMPONENT THREE: TWO ALARMS

Day three. Has a new customer completed the one action your product exists for — not the setup checklist, the actual thing? Has anyone beyond the buyer shown up? Silence here decides day-60 churn.

Renewal minus ninety. Can the champion tell the value story without you in the room? If not, you have ninety days to fix it — and no deck in the final month will do it instead.

Two dates on a calendar. That's the whole implementation.

---

WHY SO SMALL

Because the failure mode of listening systems is ambition. The CRM fields nobody fills. The health score nobody trusts. The weekly report that becomes monthly, then never.

A system survives on the effort you'll actually repeat during your worst week. One note, ten sentences, two alarms — under an hour a week, and no signal in your business depends on one person's memory again.

Your customers have been talking the whole time. This is what it looks like to keep a record of what they said.

Call it.""",
"Reply with the signal your memory almost dropped this quarter. I read every one.",
"Your customer listening system is one person's memory. Issue 11 of Call It: the minimum viable replacement — one note, ten sentences, two alarms.",
"Call It! Issue 11 — The minimum viable listening system"),

# ================= WEEK 8 (Aug 24-30) — Self-signals =================

daily("2026-08-24", "self-signals",
"Burnout doesn't announce itself. It sends the same three signals every time.",
"""Nobody wakes up burned out. You arrive there through a sequence — and the sequence is readable.

Signal one: recovery stops working. The weekend happens and Monday feels like Friday. Rest with no restore is the earliest tell, and the easiest to explain away.

Signal two: everything becomes maintenance. You stop starting things. The ideas file goes untouched. You're not doing less — you're doing nothing new. Output holds; initiative dies first.

Signal three: irritation moves closer. First it's the client. Then the team. Then the people at home who did nothing wrong.

By signal three, you're months in.

The founder move is to treat these like churn signals — because that's what they are. You are your own biggest account, and the account is signalling.

Intervene at signal one and it costs a week. At signal three, it costs a quarter.

Call it.""",
"Which of the three signals can you honestly place yourself at right now?",
"Burnout sends the same three signals: rest stops restoring, initiative dies before output does, irritation moves closer to home. Catch it at signal one and it costs a week. At three, a quarter.",
"The three burnout signals, in order",
"empathetic / direct", "make burnout legible as a readable sequence"),

daily("2026-08-25", "self-signals",
"Your calendar is a confession.",
"""Forget what you say your priorities are. Open last month's calendar and read what you actually did.

That's the real strategy document — the one written in behavior.

Mine confessed things I'd have denied in any interview: sales calls pushed to late afternoon, when I'm dull. Deep work scheduled and surrendered five times. A recurring meeting whose purpose nobody could state.

And the loudest one: nothing — anywhere — for the initiative I kept calling \"the priority.\"

A priority with zero calendar presence isn't a priority. It's a wish with good PR.

The audit takes ten minutes: pull four weeks, tag each block — creates value, maintains value, or exists out of habit. Then compare the totals to the story you tell about your company.

The gap between the two is your actual constraint.

Call it.""",
"What would last month's calendar confess about your real priorities?",
"Your calendar is a confession. A priority with zero calendar presence isn't a priority — it's a wish with good PR. Audit four weeks: creates value, maintains value, or habit.",
"The ten-minute calendar audit",
"sharp / practical", "expose the gap between stated and enacted priorities"),

daily("2026-08-26", "self-signals",
"If you keep explaining the idea badly, listen to that.",
"""You've pitched it eleven times and it never lands.

Standard advice: refine the messaging. Sometimes right. But there's a signal underneath worth checking first.

Some ideas are hard to explain because they're new.
Others are hard to explain because a part of you doesn't buy them — and that part edits every pitch mid-sentence.

Tell the difference by watching yourself, not the audience:

When you explain the new-but-true idea, you get clearer with each attempt. Version eleven is sharper than version two.

When you explain the one you don't believe, you get more elaborate. More caveats. More slides. Version eleven is longer than version two — and murkier.

Clarity grows with conviction. Complexity grows with doubt.

Before you rewrite the pitch again, ask the quieter question: do I believe this — or do I need to?

Call it.""",
"Is your hardest-to-explain idea getting sharper with each telling — or just longer?",
"Some ideas are hard to explain because they're new. Others because you don't believe them. New-but-true gets clearer each telling. Doubt gets longer. Watch which one yours is doing.",
"Clarity grows with conviction",
"introspective / sharp", "help founders distinguish novel ideas from disbelieved ones"),

daily("2026-08-27", "self-signals",
"Watch what you do the week after a big win. That's your real operating system.",
"""The week after her biggest client signing, one founder rebuilt her website. Nothing was wrong with the website.

After my best revenue month, I reorganized my task manager for two days.

The pattern is common: win, then immediately busy yourself with something safe, structural, and irrelevant.

The generous read is recovery. The honest read, most of the time, is retreat — success raised the stakes, and some part of you went looking for a corner where failure is impossible.

It matters because momentum has a half-life. The week after a win is the highest-leverage week you get: warm intro energy, proof in hand, confidence briefly matching reality. Spending it on your website is expensive.

A rule worth trying: pre-commit the post-win move before the win. \"If this closes, the next call I make is X.\"

Decide while calm. Execute while hot.

Call it.""",
"What did you do the week after your last win — advance, or reorganize?",
"After my best revenue month I reorganized my task manager for two days. Post-win retreat is real: pre-commit the next move before the win. Decide calm, execute hot.",
"The post-win retreat pattern",
"personal / story", "name the post-win retreat and give the pre-commit fix"),

daily("2026-08-28", "self-signals",
"You can't read customers better than you read yourself.",
"""Weeks of this series have covered customer silence, quiet churn, signals nobody logs.

Here's the uncomfortable symmetry: every one of those has an internal twin.

The customer who stopped complaining — and the co-founder who stopped arguing with you.
The account that went quiet — and the friend you haven't called since the business got hard.
The churn that \"came out of nowhere\" — and the burnout that will, too.

Signal literacy isn't a customer-success skill. It's one skill, pointed in two directions. Founders who ignore their own signals eventually go deaf to everyone's — because the muscle is the same muscle.

The practice is symmetric too. You run account reviews; run one on yourself. Same three questions: what changed, what repeats, what am I explaining away?

You are the account with the highest lifetime value in the company.

Read it like one.

Call it.""",
"Which customer signal from this series has an internal twin you've been ignoring?",
"Every customer signal has an internal twin. The account that went quiet — the friend you haven't called. The surprise churn — the burnout that will surprise you too. Same muscle, two directions.",
"Every customer signal has an internal twin",
"reflective / sharp", "bridge customer signals and self-signals as one literacy"),

newsletter("2026-08-30", "self-signals", 12,
"Newsletter: The founder dashboard nobody builds: you.",
"""Call It! — Issue #12
Pillar: Self-signals

You can name your MRR, churn, pipeline, and burn to the decimal.

Now: what time of day is your judgment sharpest? What's your energy trend over the last thirty days? How many made-but-unexecuted decisions are you carrying right now?

Silence, usually. The company's most load-bearing system runs unmonitored.

This issue is that dashboard — four instruments, all plain text files, total maintenance under fifteen minutes a week.

---

INSTRUMENT ONE: THE ENERGY LEDGER

Daily, one line: a number 1-5 and one word why. The value isn't the logging — it's the monthly cross-reference against your decisions. Most founders find their regrets cluster on the 2s, which turns tiredness from a mood into a rule: no pricing, no hiring, no strategy on a low day. The business doesn't slow down. The regret rate does.

---

INSTRUMENT TWO: THE OPEN-DECISION COUNT

List every decision you've made but not executed — the hire you know isn't working, the price you know is too low. Each one taxes attention daily, and the tax compounds.

Run the relief test on each: if it were executed tonight, irreversibly, would you feel relief? Relief means it isn't pending. It's decided, and overdue.

Track the count weekly. It's the truest stress metric you own.

---

INSTRUMENT THREE: THE FRICTION LOG

Weekly, list what you rewrote repeatedly, postponed again, or \"kept forgetting.\" Friction in your own output is judgment speaking pre-verbally: the proposal you can't finish is a price you don't believe; the email sitting in drafts for four days is a boundary you're scared to state.

Don't push through friction before reading it. It's the cheapest advisor you have.

---

INSTRUMENT FOUR: THE STORY CHECK

Monthly, write the story you're telling about the company in three sentences. Then list what happened this month that doesn't fit it.

The strongest founders aren't the ones with no story — everyone has a story. They're the ones who catch the story editing the evidence: \"we have momentum\" surviving two stalled deals, \"the hire is ramping\" surviving a missed month.

A story that can't be falsified by your own data isn't a strategy. It's a lullaby.

---

THE SYMMETRY

Every instrument here is a customer-signal tool pointed inward. The ledger reads your usage. The friction log reads your tickets. The story check audits your health score.

It's one literacy in two directions — and founders who go deaf inward eventually go deaf outward, because it's the same muscle.

You are the account with the highest lifetime value in the company. Read yourself like one.

Call it.""",
"Reply with your open-decision count. Just the number. I read every one.",
"The founder dashboard nobody builds: you. Issue 12 of Call It — four instruments, all text files, fifteen minutes a week.",
"Call It! Issue 12 — The founder dashboard"),

# ================= WEEK 9 (Aug 31-Sep 8) — AI leverage =================

daily("2026-08-31", "ai-leverage",
"Your CRM knows why deals die. Nobody has ever asked it.",
"""Somewhere in your CRM is the full transcript of every deal you've lost — notes, emails, stage changes, timestamps.

You've read each one once, in real time, while hoping. Hope is a terrible reading condition.

Export the last twenty lost deals and hand them to AI with three questions:
What did these have in common at the moment they stalled?
What phrase or request showed up before the silence?
What did I keep saying right before losing?

One founder ran this and found her tell in minutes: in every lost deal, she'd offered a discount before the prospect ever raised price. She was negotiating against herself — teaching prospects to hesitate.

No dashboard shows that. It lives in the language, and language is exactly what AI reads well.

Your CRM is not a database. It's an unread confession.

Call it.""",
"What would twenty lost deals, read all at once, say about your selling?",
"Your CRM holds every lost deal's full story, read once each, in real time, while hoping. Read all twenty at once with AI. One founder found she offered discounts before anyone raised price.",
"The unread confession in your CRM",
"sharp / practical", "turn lost-deal archives into a pattern read"),

daily("2026-09-01", "ai-leverage",
"The 20-minute Monday ritual that replaced my gut-check with a read.",
"""Every Monday, before email, I feed one context file to AI: last week's customer conversations, pipeline moves, and my own Friday note about how the week felt.

Three questions, always the same:
What changed versus the previous week?
What repeats that I haven't acted on?
Where does the data disagree with my Friday note?

That third one earns the ritual its slot. It compares the founder's story to the founder's evidence.

Some Mondays they match — proceed with confidence. The interesting Mondays are the splits: I felt momentum, the data shows two stalled deals and a quiet champion. Or the reverse — I felt behind, and everything had actually advanced.

Both splits used to cost me a week of steering by mood.

Twenty minutes. Not to replace judgment — to give judgment better inputs than a feeling formed at 7am.

Call it.""",
"If you compared last week's story to last week's evidence, would they match?",
"Monday ritual: feed last week's conversations plus my own Friday note to AI. Third question does the work — where does the data disagree with my story? Steering by mood is expensive.",
"Story versus evidence, every Monday",
"personal / practical", "model a concrete weekly AI review ritual"),

daily("2026-09-02", "ai-leverage",
"AI didn't make me faster. It made me harder to fool.",
"""The productivity framing undersells what actually changed.

Yes — drafts come quicker, summaries are free. Fine.

The real shift: I can no longer tell myself comfortable stories, because checking them costs ninety seconds.

\"Churn is just seasonal.\" Paste the cancellations, ask for patterns. It wasn't seasonal.
\"Customers love the new feature.\" Paste the tickets. Three power users routed around it.
\"That deal is still alive.\" Paste the thread. Watch the reply lengths shrinking. It was not alive.

Before, testing a belief meant hours I didn't have — so beliefs went untested and the convenient ones survived. Now the excuse is gone, and losing that excuse is worth more than every draft AI has ever written me.

The founders who win with AI won't be the ones producing more.
They'll be the ones deceiving themselves less.

Call it.""",
"What's the comfortable story you could test in ninety seconds — and haven't?",
"AI didn't make me faster. It made me harder to fool. Comfortable stories used to survive because checking them cost hours. Now it costs ninety seconds, and the excuse is gone.",
"Harder to fool",
"sharp / personal", "reframe AI value from output speed to self-honesty"),

daily("2026-09-03", "ai-leverage",
"Stop asking AI to sound like you. Ask it to disagree with you.",
"""Half the prompts founders write are mirrors: match my tone, confirm my plan, polish my thinking.

The leverage is in the opposite direction.

Before anything major ships — pricing change, key hire, big pivot — run a red-team pass:

\"Here's my plan and my reasoning. Argue against it seriously. Attack the assumptions, not the grammar. Then tell me the earliest observable signal that would prove me wrong.\"

That last clause is the payoff. Not \"is this right\" — you can't know yet — but \"how will I know early?\"

It's a solo founder's board meeting. No politics, no ego to manage, available at midnight.

The plan usually survives. But it ships with named risks and tripwires instead of vibes — and when a tripwire fires in week three, you move in days instead of quarters.

Agreement is cheap now. Disagreement is the scarce resource.

Call it.""",
"What decision are you about to make that has never been seriously argued against?",
"Stop asking AI to sound like you. Ask it to disagree: attack my assumptions, then name the earliest signal that would prove me wrong. A solo founder's board meeting, available at midnight.",
"The red-team prompt",
"contrarian / practical", "teach adversarial prompting as decision hygiene"),

daily("2026-09-04", "ai-leverage",
"One prompt, run monthly, tells you more than most dashboards.",
"""Here it is:

\"Below are my assumptions from thirty days ago, and what actually happened since. Where do assumption and outcome diverge most? What was the earliest signal of that divergence? What am I likely still wrong about?\"

It requires a habit most founders skip: writing assumptions down before the month starts. Five lines. \"Churn stays under 3%. The new offer converts. The hire is ramped by week four.\"

Without the written version, hindsight edits your memory — you'll believe you \"basically expected\" whatever happened. Every founder does. It's how judgment stops improving.

With it, you get a monthly calibration score on the only instrument your company runs on: your predictions.

Dashboards measure the business. This measures the founder.

Thirty days from now is the soonest you can start. Which means the five lines are due today.

Call it.""",
"What are your five assumption lines for the next thirty days?",
"Write five assumptions today. In thirty days, ask AI: where did assumption and outcome diverge, and what was the earliest signal? Dashboards measure the business. This measures the founder.",
"The monthly calibration prompt",
"direct / practical", "install the written-assumptions calibration loop"),

daily("2026-09-07", "ai-leverage",
"The cheapest research team you'll ever hire is a folder of old emails and one good question.",
"""Founders pay for market research while sitting on the best dataset in their niche: every conversation anyone has ever had with their customers.

Two years of email threads. Call notes. Cancellation messages. Onboarding questions. Primary-source research on the exact people you sell to — unpolished, unincentivized, true.

The reason it goes unused: it's unreadable at human speed. Two thousand emails don't fit in a founder's evening.

They fit in a context window.

This week's experiment: export one relationship — a single customer, start to finish — and ask AI for the arc. Where did their language shift from evaluating to relying? What did they ask early that they stopped asking? When were they closest to leaving?

You'll learn more about your product from one relationship's full arc than from any survey you could commission.

Then run the next one.

Call it.""",
"Which customer relationship would teach you the most, read start to finish?",
"Founders buy market research while sitting on two years of customer emails — primary-source data on the exact people they sell to. Unreadable at human speed. Fits in a context window.",
"One relationship, read start to finish",
"practical / teaching", "unlock archived conversations as research material"),

daily("2026-09-08", "ai-leverage",
"Two months of daily signals. Here's what stayed true.",
"""Since July, this series has covered customer silence, founder energy, hedged forecasts, and unread CRMs. Sixty days on, three things kept proving themselves:

Signals precede events. Always. The churn, the burnout, the dead deal — each had a 60-to-90-day window where the outcome was still in play. Nothing \"came out of nowhere.\" Ever.

The bottleneck is never data. Every founder who ran the exercises found the signal already in their possession — in tickets, threads, calendars, their own drafts. Collection was done. Reading wasn't.

Capacity beats tools. The founders who got the most from these two months didn't buy anything. They built one weekly habit and kept it.

Signal literacy isn't a technique you finish learning. It's a posture: assume the information already exists, and go read it.

The next unread signal is already sitting in your inbox.

Call it.""",
"What's the one signal from these two months you actually acted on? Tell me — I keep score.",
"Two months of daily signals, three things that stayed true: signals precede events, the bottleneck is never data, capacity beats tools. The next unread signal is already in your inbox.",
"Sixty days of signals — what held",
"reflective / sharp", "close the two-month arc and reinforce the core theses"),

newsletter("2026-09-06", "ai-leverage", 13,
"Newsletter: Build the reading habit before you buy the reading tool.",
"""Call It! — Issue #13
Pillar: AI leverage for solo founders

Two months of this series, condensed to one sequence: what to do first, second, and third if you want a business that reads its own signals — and why buying software is step three, not step one.

---

STEP ONE: PROVE THE SIGNAL EXISTS (WEEK ONE)

One sitting, ninety minutes, using data you already have. Paste your last twenty customer conversations into any long-context model and ask three questions: what patterns exist here, what changed over time, what are customers asking for that they're not getting.

You're not building anything yet. You're establishing the fact that changes everything after: your business has been answering questions you never asked, in writing, for years.

Every founder who runs this finds at least one thing they didn't know. That thing is your proof.

---

STEP TWO: BUILD THE HABIT (WEEKS TWO THROUGH EIGHT)

The weekly hour from Issue #9: collect the week into one file, ask what changed, what repeats, what disagrees with your assumptions. Record three dated sentences. Make one move before the hour ends.

Add the monthly layer: five written assumptions at the start of the month, one calibration prompt at the end — where did assumption and outcome diverge, and what was the earliest signal?

Six to eight weeks in, something shifts: the same signal appears twice, and you catch a trend forming instead of autopsying an outcome. That's the habit paying for itself.

Do not skip to step three before this happens. A tool bolted onto no habit becomes one more unread dashboard.

---

STEP THREE: SYSTEMATIZE WHAT PROVED ITSELF

Only now does tooling make sense — because you know exactly what you'd automate. Not \"AI for my business\" but: the weekly delta read on support threads. The said-twice detector. The lost-deal language scan. Specific, proven, worth engineering.

Some founders script it themselves. Some stay manual forever — an hour a week is a fine price for signal literacy.

And some reach the honest limit of the founder-plus-prompts setup: more sources than one context window holds, more history than one person can curate, signals that need reading daily rather than weekly.

That limit is real, and it's the point where this stops being a habit problem and becomes an engineering problem. It's also the problem I work on at org scale — building external brains that read a company's signals continuously. If you're at that limit, I'm easy to find: cal.com/flowityai/discovery. No pitch beyond that sentence — the ladder above is complete without me.

---

THE POSTURE

Signal literacy was never about AI. AI just removed the last excuse. The information exists, the reading costs an hour, and the founders who compound are the ones who assume the answer is already in their data — and go read it.

Sixty days of this series says the same thing every week, in different clothes:

The signal is already there.

Call it.""",
"Reply with where you are — step one, two, or three. I read every one.",
"Build the reading habit before you buy the reading tool. Issue 13 of Call It: the three-step ladder from first prompt to signal system.",
"Call It! Issue 13 — The ladder"),
]


# ---------------------------------------------------------------- main
def main():
    if not os.path.exists(BAK):
        shutil.copy2(DB, BAK)
        print(f"backup created: {BAK}")
    else:
        print(f"backup exists, skipped: {BAK}")

    con = sqlite3.connect(DB)
    cur = con.cursor()

    # 1. re-dates
    for pid, dt in REDATES.items():
        cur.execute(
            "update posts set scheduled_at=?, updated_at=datetime('now') where id=?",
            (dt, pid))
    print(f"re-dated {len(REDATES)} existing posts (ids {sorted(REDATES)})")

    # 2. inserts (idempotent on hook)
    inserted = skipped = 0
    for p in POSTS:
        if cur.execute("select 1 from posts where hook=?", (p["hook"],)).fetchone():
            skipped += 1
            continue
        notes = f"{BATCH} | pillar:{p['pillar']}"
        if p["issue"]:
            notes += f" | issue:{p['issue']}"
        cur.execute(
            """insert into posts
               (hook, body, cta, short_x, alt_title, channel, tone, objective,
                format, status, scheduled_at, generation_mode, notes,
                created_at, updated_at)
               values (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))""",
            (p["hook"], p["body"], p["cta"], p["short_x"], p["alt_title"],
             p["channel"], p["tone"], p["objective"], p["fmt"],
             "revised", p["date"], "manual", notes))
        inserted += 1
    con.commit()
    print(f"inserted {inserted}, skipped (already present) {skipped}")

    # 3. verification
    print("\n-- status counts --")
    for row in cur.execute("select status, count(*) from posts group by status"):
        print(f"  {row[0]}: {row[1]}")

    print("\n-- calendar Jul 8 - Sep 8 --")
    rows = cur.execute(
        """select date(scheduled_at), id, channel, substr(hook,1,60)
           from posts where date(scheduled_at) between '2026-07-08' and '2026-09-08'
           order by scheduled_at, id""").fetchall()
    covered = {}
    for d, pid, ch, hook in rows:
        covered.setdefault(d, []).append((pid, ch, hook))
        print(f"  {d}  #{pid:<3} {ch:<10} {hook}")

    # weekday holes
    holes, dupes = [], []
    day = WINDOW_START
    while day <= WINDOW_END:
        iso = day.isoformat()
        if day.weekday() < 5:  # Mon-Fri
            n = sum(1 for r in covered.get(iso, []) if r[1] == "linkedin")
            if n == 0 and iso not in AIRTABLE_WEEKDAYS:
                holes.append(iso)
            if n > 1:
                dupes.append(iso)
        day += timedelta(days=1)

    # duplicate dates overall (same channel, same date)
    for d, items in covered.items():
        chans = [c for _, c, _ in items]
        for ch in set(chans):
            if chans.count(ch) > 1 and d not in dupes:
                dupes.append(d)

    # newsletters per week
    news = [d for d, items in covered.items() if any(c == "newsletter" for _, c, _ in items)]
    print(f"\n-- newsletters ({len(news)}): {sorted(news)}")
    print(f"-- weekday holes (excl. Airtable-covered {sorted(AIRTABLE_WEEKDAYS)}): {holes or 'NONE'}")
    print(f"-- duplicate dates (same channel): {sorted(dupes) or 'NONE'}")
    con.close()


if __name__ == "__main__":
    main()
