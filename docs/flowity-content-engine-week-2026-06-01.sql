-- Flowity Content Engine seed: LinkedIn schedule for 2026-06-01 through 2026-06-07
-- Target used by Hermes on 2026-05-31: Supabase project yrqbzaqbracrgaxzhyxr (Flowity Brain), because the dedicated Flowity Content Engine project vaknochyqubfawnirqjz was paused/inactive.
-- Batch marker: content-engine-batch:2026-06-01

create table if not exists sources (
  id bigserial primary key,
  title varchar(255) not null,
  source_type varchar(50) not null,
  content text not null,
  theme varchar(100),
  audience varchar(100),
  origin varchar(255),
  tags_json text,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists posts (
  id bigserial primary key,
  hook varchar(280) not null,
  body text,
  cta varchar(280),
  short_x varchar(280),
  alt_title varchar(280),
  channel varchar(20) not null default 'linkedin',
  tone varchar(50),
  objective varchar(100),
  format varchar(50),
  status varchar(20) not null default 'idea',
  scheduled_at timestamp,
  published_at timestamp,
  generation_mode varchar(20),
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists post_sources (
  id bigserial primary key,
  post_id bigint references posts(id) on delete cascade,
  source_id bigint references sources(id) on delete cascade
);

create table if not exists generation_runs (
  id bigserial primary key,
  post_id bigint references posts(id) on delete cascade,
  prompt_used text,
  model_used varchar(100),
  mode varchar(20),
  raw_output text,
  parsed_hook text,
  parsed_body text,
  parsed_cta text,
  parsed_short_x text,
  token_estimate int,
  status varchar(20),
  created_at timestamp default now()
);

delete from post_sources where post_id in (select id from posts where notes like '%content-engine-batch:2026-06-01%');
delete from generation_runs where post_id in (select id from posts where notes like '%content-engine-batch:2026-06-01%');
delete from posts where notes like '%content-engine-batch:2026-06-01%';
delete from sources where notes like '%content-engine-batch:2026-06-01%';

with inserted_sources as (
  insert into sources (title, source_type, content, theme, audience, origin, tags_json, notes) values
  ('GTM focus: first paying client', 'insight', 'Flowity AI is a premium productized service, not SaaS. The immediate goal is the first paying client, then proof, then price escalation.', 'gtm', 'Founder-led B2B SaaS CEOs', 'flowity-brain/GTM_PLAYBOOK.md', '["gtm","first-client","premium-service"]', 'content-engine-batch:2026-06-01'),
  ('Positioning: external executive brain', 'frase', 'Sell decision clarity, not generic AI automation: an external AI Brain that turns scattered customer and business signals into clearer priorities.', 'positioning', 'Founder, CEO, COO, Head of Product', 'flowity-brain + LinkedIn outreach strategy', '["positioning","decision-intelligence","signal-audit"]', 'content-engine-batch:2026-06-01'),
  ('GTM lane: reactivate LinkedIn pool', 'insight', 'Primary acquisition lane: reactivate ~1,000 accepted LinkedIn connections in Europe and Brazil while posting content daily; defer cold email until warm/reactivation and content prove insufficient.', 'outbound', 'Warm LinkedIn connections and EU founders', 'GTM_PLAYBOOK.md / REVENUE_PLAN.md', '["linkedin","reactivation","europe-first"]', 'content-engine-batch:2026-06-01'),
  ('Product reality: weekly executive intelligence', 'insight', 'The offer is a human-in-the-loop premium intelligence service: connect sources, surface signals, deliver weekly executive briefs, recommended moves, and monthly reviews.', 'product', 'B2B SaaS leadership teams', 'flowity-executive-hub onboarding strategy', '["executive-brief","human-in-the-loop","premium"]', 'content-engine-batch:2026-06-01')
  returning id, title
), posts_to_insert as (
  insert into posts (hook, body, cta, short_x, alt_title, channel, tone, objective, format, status, scheduled_at, generation_mode, notes) values
  ('Most founders do not have a data problem. They have a signal problem.',
   'Most founder-led companies are already surrounded by useful signals. Support tickets. Sales calls. Churn notes. Product feedback. Internal Slack threads. The problem is not that the data is missing. The problem is that the important signals are scattered, late, and competing with everything else on the founder’s desk. Flowity AI is being built around a simple idea: leadership teams should not need to dig through five tools to know what deserves attention this week. The work is to turn scattered business text into executive intelligence: risks, patterns, priorities, and recommended moves. Not another dashboard to babysit. A clearer operating rhythm for decisions.',
   'If you run a B2B SaaS team, where do your most important customer signals currently get buried?',
   'Most founders do not have a data problem. They have a signal problem: scattered support, sales, churn, and product feedback that never becomes a weekly executive priority.',
   'The signal problem hiding inside founder-led companies', 'linkedin', 'estratégico', 'position Flowity as decision intelligence', 'narrativa', 'scheduled', '2026-06-01 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:mon | source:gtm'),
  ('Signal debt is what happens when the business knows something before leadership acts on it.',
   'There is a kind of debt that does not show up in engineering roadmaps: signal debt. It builds when the same complaint appears in support for weeks. When sales keeps hearing the same objection but product never sees the pattern. When churn risk is visible in scattered comments before it appears in revenue. By the time the metric moves, the company is already late. This is why Flowity AI focuses on weak signals first. The goal is not to summarize everything. The goal is to surface the few signals that would change what the founder, CEO, or product lead does next.',
   'What is one recurring customer signal your team probably notices before your dashboard does?',
   'Signal debt: when the business knows something before leadership acts on it.',
   'Why weak signals matter before metrics move', 'linkedin', 'educativo', 'teach signal debt concept', 'dado', 'scheduled', '2026-06-02 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:tue | source:positioning'),
  ('The premium AI product will not feel like software at first. It will feel like being held.',
   'A lot of AI tools ask the client to do more work: configure the workspace, tune the prompts, interpret the output, decide what matters. That is not the experience Flowity AI is aiming for. The first version is intentionally premium and human-in-the-loop. The founder is held through onboarding. Sources are connected with care. The first briefs are explained in business language. The system learns the executive context before pretending to be autonomous. This matters because Flowity AI is not trying to be another self-serve SaaS. It is a productized intelligence service: software plus judgment, built to help leadership see clearly.',
   'Where do you think AI products still need a human layer to feel trustworthy?',
   'The premium AI product will not feel like software first. It will feel like being held.',
   'Why Flowity AI is service-led before it is self-serve', 'linkedin', 'estratégico', 'explain premium service model', 'narrativa', 'scheduled', '2026-06-03 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:wed | source:onboarding'),
  ('Pricing resistance is not just an objection. It is a signal.',
   'When a prospect says “this is expensive,” the lazy response is to defend the price. The better response is to diagnose what they are comparing it to. Are they comparing it to another tool? To an employee’s time? To the cost of missing churn risk? To the opportunity cost of slow decisions? Flowity AI is priced as an executive intelligence service because the value is not the number of analyzed messages. The value is the decision that happens earlier because the right signal became visible. If one surfaced pattern prevents a lost account, stops a bad product bet, or clarifies a priority for the week, the conversation changes.',
   'What do your customers usually compare your product to when they call it expensive?',
   'Pricing resistance is a signal. It tells you what the buyer thinks the real alternative is.',
   'The hidden diagnostic inside pricing objections', 'linkedin', 'direto', 'connect sales objections to Flowity signal thinking', 'pergunta', 'scheduled', '2026-06-04 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:thu | source:call-playbook'),
  ('Monday should not start with digging.',
   'A common founder routine: open Slack, check support, scan CRM notes, look at churn, ask product what changed, try to remember last week’s customer calls, then decide what matters. That is not leadership. That is excavation. Flowity AI is being built around a different Monday: a weekly executive brief that says what changed, what patterns are emerging, what risks need attention, and what moves are worth making now. The promise is simple: fewer scattered tabs, more visible priorities. The best operating systems do not create more information. They reduce the cost of knowing what matters.',
   'If your Monday brief had only three sections, what would you want in it?',
   'Monday should not start with digging. It should start with visible priorities.',
   'A better Monday operating rhythm for founders', 'linkedin', 'inspiracional', 'show weekly executive brief use case', 'lista', 'scheduled', '2026-06-05 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:fri | source:product'),
  ('The first Flowity AI clients will not buy automation. They will buy clarity.',
   'The early Flowity AI GTM is intentionally narrow: founder-led B2B companies where customer, product, support, and sales signals are already scattered. The first offer is not “let us automate your company.” It is closer to: let us run a Signal Audit, connect the most useful sources, and show you what your business has been trying to tell you. That is the wedge. Clarity first. Automation later. This keeps the sales conversation grounded in the founder’s real pains: churn risk, slow priorities, repeated objections, and decisions made with partial context.',
   'If you are a founder with scattered customer signals, I am happy to map what a Signal Audit could look like for your company.',
   'The first Flowity AI clients will not buy automation. They will buy clarity.',
   'The GTM wedge: Signal Audit before automation', 'linkedin', 'direto', 'soft CTA for first client', 'narrativa', 'scheduled', '2026-06-06 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:sat | source:gtm'),
  ('Content is not separate from outbound. It is the trust layer around it.',
   'For a premium service, cold messages alone carry too much trust debt. The prospect asks: Who is this? What do they believe? Do they understand my problem? Can they think clearly? That is why the Flowity AI content engine exists. Daily LinkedIn posts are not vanity. They are the public proof layer around the direct GTM motion: reactivating warm connections, starting founder conversations, and turning signal problems into calls. The goal is not to post forever. The goal is to make every outbound touch warmer because the market can see the thinking before the pitch.',
   'What is one belief your buyers should understand before they ever take a call with you?',
   'Content is not separate from outbound. It is the trust layer around it.',
   'Why daily LinkedIn content supports premium outbound', 'linkedin', 'estratégico', 'explain content engine role in GTM', 'narrativa', 'scheduled', '2026-06-07 12:00:00', 'manual', 'content-engine-batch:2026-06-01 | day:sun | source:content-engine')
  returning id, notes
)
insert into post_sources (post_id, source_id)
select p.id, s.id
from posts_to_insert p
join inserted_sources s on true;

select id, hook, status, scheduled_at, channel
from posts
where notes like '%content-engine-batch:2026-06-01%'
order by scheduled_at;
