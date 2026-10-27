-- Call It! week: 2026-06-15 — newsletter anchor + LinkedIn/X posts
-- Pillar 3: AI leverage for solo founders
-- Batch marker: content-engine-batch:2026-06-15

delete from post_sources where post_id in (select id from posts where notes like '%content-engine-batch:2026-06-15%');
delete from generation_runs where post_id in (select id from posts where notes like '%content-engine-batch:2026-06-15%');
delete from posts where notes like '%content-engine-batch:2026-06-15%';
delete from sources where notes like '%content-engine-batch:2026-06-15%';

with inserted_sources as (
  insert into sources (title, source_type, content, theme, audience, origin, tags_json, notes) values
  ('AI as signal reader, not content machine', 'insight', 'Most founders use AI to produce: write emails, draft posts, summarize meetings. The real leverage is using AI to read: surfacing patterns already in customer data, support tickets, CRM notes, cancellation surveys. Direction of information flow determines the value.', 'ai-leverage', 'Solo founders and women solopreneurs', 'Call It! pillar 3 - AI leverage', '["ai","signal-reading","prompts","founders"]', 'content-engine-batch:2026-06-15'),
  ('Three signal-reading AI prompts', 'insight', 'Churn Pattern Prompt: feed last X cancellation messages, ask for top 3 behavioral patterns and what customers asked for before leaving. Quiet Customer Prompt: feed inactive customers, ask what silence means per profile. Assumption Audit Prompt: list assumptions vs actual outcomes, ask where they diverge most.', 'ai-leverage', 'Solo founders', 'Call It! Issue #3', '["prompts","churn","signal","ai-workflow"]', 'content-engine-batch:2026-06-15'),
  ('AI context window as strategic asset', 'insight', 'With 200k+ token context windows, founders can paste entire client history into one prompt. The bottleneck is no longer AI capability — it is how founders frame the question. Most are pointing AI outward at output. Signal readers point it inward at existing data.', 'ai-leverage', 'Tech-forward solo founders', 'Call It! Issue #3 signals section', '["context-window","llm","strategic-use"]', 'content-engine-batch:2026-06-15')
  returning id, title
),
posts_to_insert as (
  insert into posts (hook, body, cta, short_x, alt_title, channel, tone, objective, format, status, scheduled_at, generation_mode, notes) values

  -- Newsletter anchor (Sunday June 15 — sharing the Beehiiv issue)
  ('Newsletter: You are using AI to create. The founders ahead of you are using it to read.',
   'Call It! — Issue #3
Pillar: AI leverage for solo founders

Most founders have 12 months of customer feedback sitting in support tickets. Three quarters of sales call notes in a CRM nobody reviews. Cancellation surveys that all say "timing wasn''t right" — when timing wasn''t right means five different things and one of them is a real problem.

They are not ignoring this data. They are just not equipped to read it faster than the next decision has to get made.

That is where AI changes the game — if you ask it the right thing.

The wrong question most founders ask AI:
"Write me an email to this customer."

The right question:
"Here are my last 15 support interactions. What are the top 3 patterns? What question do customers ask most before they stop responding?"

The first produces something. The second names something that was already happening.

Three prompts you can run this week with real data you already have:

Churn Pattern Prompt: "Here are [X] cancellation messages from the last 90 days. Identify the top 3 behavioral patterns. What did these customers have in common before they churned? What were they asking for that they didn''t get?"

Quiet Customer Prompt: "Here are [X] customers who haven''t interacted in the last 30 days. Based on their past messages and behavior, what might silence mean for each profile? Group them by the most likely reason they''ve gone quiet."

Assumption Audit Prompt: "Here are my top 5 assumptions going into this quarter: [list]. Here is what actually happened: [data]. Where do my assumptions and reality diverge most? What signal did I likely miss early?"

These work in ChatGPT, Claude, or any model with a long context window. The key is feeding them real data, not hypotheticals.

Also in this issue: a case study of a founder who caught a retention risk before it showed in any metric, and three signals worth watching this week in AI, SaaS, and founder behavior.

Call it.',
   'If this is the kind of signal literacy you want to build, follow Call It! — link in comments.',
   'You are using AI to create. The founders ahead are using it to read. Issue 3 of Call It: three prompts you can run this week with real data you already have.',
   'Call It! Issue 3 — AI as signal reader, not content machine',
   'linkedin', 'newsletter / sharp / grounded', 'publish weekly newsletter and drive Beehiiv subscriptions', 'newsletter-anchor', 'idea',
   '2026-06-15 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:newsletter | channel:linkedin-newsletter | pillar:ai-leverage | sequence:00 | week_anchor:true'),

  -- Monday June 16: teaching anchor
  ('Everyone is using AI to create. The founders I watch closest are using it to read.',
   'Everyone is using AI to create.
The founders I watch closest are using it to read.

There is a gap between those two things most people have not noticed yet.

Creating means producing something that did not exist.
Reading means surfacing something that was already there and you were missing.

Most AI use lives in the first category.
Write this email. Draft this post. Summarize this meeting.

Useful. But shallow.

The real leverage is in the second.

Because your business has been producing data for months. Support tickets. Cancellation surveys. Sales call notes. Customers going quiet. Customers asking the same question three times.

You have collected it. You have not read it. Not really.

AI can read it in 90 seconds — if you give it the right thing.

The prompt that changed how I think about this:

"Here are my last 15 support interactions. What are the top 3 patterns? What are customers asking for most in the 30 days before they stop responding?"

What it surfaces is not new information.
It is the signal that was already there, waiting.

This week''s newsletter goes deeper — three prompts you can run with real data you already have. Link in comments.

Call it.',
   'Try it this week: paste 10 real support interactions into AI and ask what the pattern is. The result is not a draft. It is a read.',
   'Everyone is using AI to create. The founders ahead are using it to read. The direction of information flow is the entire difference.',
   'AI as signal reader — the direction of information flow is the difference',
   'linkedin', 'sharp / grounded / teaching', 'drive newsletter reads and signal-literacy positioning', 'linkedin-post + matching-x', 'idea',
   '2026-06-16 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:linkedin | x_match:true | pillar:ai-leverage | derived_from:newsletter | sequence:01'),

  -- Tuesday June 17: specific prompt
  ('The most useful AI prompt I have found for founders has nothing to do with writing.',
   'The most useful AI prompt I have found for founders has nothing to do with writing.

It is this:

"Here are [X] cancellation messages from the last 90 days. What did these customers have in common before they churned? What were they asking for that they did not get?"

You paste real data in.
You stop asking AI to invent.
You start asking AI to read.

The pattern it surfaces was already in your business.
You just did not have time to find it.

The same logic works for quiet customers, repeated objections in sales calls, support tickets that cluster around the same friction.

AI does not need to be smarter than you to be useful here.
It just needs to be faster at pattern recognition than you have time to be.

That is the entire leverage.

Call it.',
   'Try it this week. Paste 15 of your last customer interactions into any AI with a long context window. Ask: what is the pattern I am not naming?',
   'The most useful AI prompt for founders has nothing to do with writing. Paste real cancellation data. Ask what customers had in common. That is signal-reading, not content creation.',
   'The AI prompt that reads your churn before you do',
   'linkedin', 'direct / practical', 'give one actionable tool tied to newsletter pillar', 'linkedin-post + matching-x', 'idea',
   '2026-06-17 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:linkedin | x_match:true | pillar:ai-leverage | derived_from:newsletter | sequence:02'),

  -- Wednesday June 18: case study
  ('A founder I know does a quarterly ritual that takes about 30 minutes.',
   'A founder I know does a quarterly ritual that takes about 30 minutes.

She pastes three things into one AI prompt:
— Her 10 most recent client check-in notes
— Feedback from any client who did not renew
— The assumptions she wrote down at the start of the quarter

She asks: "What signal am I not naming?"

Last quarter, AI flagged something she had noticed but dismissed.

Two high-value clients had both asked about next steps earlier than usual in the engagement. Not a complaint. Not a red flag. Just earlier than her norm.

She ran the same prompt on her active clients. Three more showed the same behavior.

She built a milestone check-in into her delivery model before a single client mentioned feeling unclear about where things were heading.

Not reactive. Signal-reading at leverage.

The tool was not special. The question was.

Call it.',
   'The 30-minute quarterly ritual: paste client notes, non-renewals, and your own assumptions into AI. Ask what signal you are not naming. Run it before Q3 planning.',
   'A founder pastes client notes, non-renewals, and her H1 assumptions into one AI prompt. Asks what signal she is not naming. 30 minutes. Last quarter it caught a retention risk before it was visible anywhere.',
   'The 30-minute AI ritual that surfaces what your data is hiding',
   'linkedin', 'empathetic / story / concrete', 'make AI signal-reading feel real and achievable', 'linkedin-post + matching-x', 'idea',
   '2026-06-18 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:linkedin | x_match:true | pillar:ai-leverage | derived_from:newsletter | sequence:03'),

  -- Thursday June 19: contrarian take
  ('Hot take: most AI advice for founders is solving the wrong problem.',
   'Hot take: most AI advice for founders is solving the wrong problem.

"Use AI to write faster."
"Use AI to create more content."
"Use AI to scale your output."

Output is not what is killing businesses right now.

Unread signals are.

Founders are not struggling because they are not producing enough.
They are struggling because they are not reading what their customers are actually telling them — in support tickets, in silence, in early departures, in the objection they hear five times and log zero times.

AI is the most powerful signal-reading tool founders have ever had access to.

Most of us are using it to generate LinkedIn posts.

The most useful thing you could do with AI this week is not write something.
It is read something that is already there.

Call it.',
   'What is one data source in your business that AI could read faster than you currently do?',
   'Most AI advice for founders is solving the wrong problem. Output is not killing businesses. Unread signals are. The most powerful thing AI can do is not write for you. It is read what is already there.',
   'The wrong problem most AI advice for founders is solving',
   'linkedin', 'contrarian / direct', 'provoke rethink of AI use and position signal-reading as real leverage', 'linkedin-post + matching-x', 'idea',
   '2026-06-19 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:linkedin | x_match:true | pillar:ai-leverage | derived_from:newsletter | sequence:04'),

  -- Friday June 20: light engagement
  ('Quick check-in for anyone who ran the AI signal prompts this week.',
   'Quick check-in for anyone who ran the AI signal prompts this week.

What did you feed it?
What came back that surprised you?

The founders who get the most out of this are not using more sophisticated tools.
They are using the same models as everyone else — pointed at real data instead of hypotheticals.

One founder. One data dump. One useful signal.
That is the whole workflow.

If you have not tried it yet, the barrier is simpler than it looks. Pull 10 support tickets or your last 15 customer emails. Paste them. Ask: what is the pattern I am not naming?

The answer will not always be dramatic.
But it will always be real.

Call it.',
   'Drop what you found in the comments or DM me. I am genuinely curious what surfaces when you point AI inward instead of outward.',
   'Tried the AI signal prompts this week? What did you feed it? The founders getting real value are not using better tools. They are using any tool with real data instead of hypotheticals.',
   'What surfaced when you pointed AI at real data this week?',
   'linkedin', 'light / conversational / community', 'close the week with engagement and reinforce the habit', 'linkedin-post + matching-x', 'idea',
   '2026-06-20 12:00:00', 'manual',
   'content-engine-batch:2026-06-15 | social_tag:linkedin | x_match:true | pillar:ai-leverage | derived_from:newsletter | sequence:05')

  returning id, notes
)
insert into post_sources (post_id, source_id)
select p.id, s.id
from posts_to_insert p
join inserted_sources s on true;

select id, hook, status, scheduled_at, channel
from posts
where notes like '%content-engine-batch:2026-06-15%'
order by scheduled_at;
