-- Add first-class newsletter channel + today LinkedIn post
-- Run against the active Content Engine database if reseeding manually.

alter table posts drop constraint if exists posts_channel_check;
alter table posts add constraint posts_channel_check check (channel in ('linkedin', 'x', 'newsletter'));

update posts
set channel = 'newsletter',
    notes = replace(notes, 'channel:linkedin-newsletter', 'channel:newsletter')
where id = 15;

insert into posts (hook, body, cta, short_x, alt_title, channel, tone, objective, format, status, scheduled_at, generation_mode, notes)
select
  'Your customers are already writing part of your strategy. The problem is that the notes are scattered.',
  'Your customers are already writing part of your strategy.

Not in a clean document.
Not in a perfect dashboard.
Not in one obvious place.

They are writing it in the objections your sales team keeps hearing.
In the support tickets that sound small until they repeat.
In the feature requests that are really asking for confidence.
In the customer who goes quiet before anyone calls it churn risk.
In the phrases your team remembers but never has time to connect.

This is why I think a lot of founder-led companies do not have a “we need more data” problem.

They have a “we need to hear the business sooner” problem.

The signals are there. They are just split across tools, teams, conversations, and memory. So the founder ends up doing the hidden work manually: asking around, checking Slack, scanning CRM notes, remembering calls, trying to separate noise from pattern.

That is expensive. Not just in time, but in clarity.

Because when a signal stays scattered, the decision comes late.

Flowity is being built around this belief: customer language should become executive clarity. Not another dashboard to babysit. A weekly read on what changed, what repeated, what looks risky, and what deserves a decision.

If your business already knows something your leadership rhythm has not named yet, that is the place to look.',
  'If you looked across sales, support, product, and customer success this week, what signal would probably repeat?',
  'Your customers are already writing part of your strategy: objections, support tickets, quiet accounts, repeated phrases. The problem is not missing data. It is scattered signals that never become executive clarity.',
  'Customer language should become executive clarity',
  'linkedin',
  'empathetic / strategic / not-salesy',
  'today LinkedIn post: create Flowity-fit aha moment from newsletter customer-signals pillar',
  'linkedin-post + matching-x',
  'revised',
  '2026-06-01 15:00:00+00',
  'manual',
  'content-engine-strategy:call-it:2026-06-01 | social_tag:linkedin | x_match:true | pillar:customer-signals | derived_from:newsletter | day:mon-extra | ready_to_post_today:true'
where not exists (select 1 from posts where notes like '%day:mon-extra%');
