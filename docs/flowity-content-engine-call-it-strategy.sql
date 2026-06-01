-- Flowity Content Engine seed: Call It! community/newsletter strategy + first pillar-led content batch
-- Target: Supabase project vaknochyqubfawnirqjz (Flowity Content Engine)
-- Batch marker: content-engine-strategy:call-it:2026-06-01

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

delete from post_sources where post_id in (select id from posts where notes like '%content-engine-strategy:call-it:2026-06-01%');
delete from generation_runs where post_id in (select id from posts where notes like '%content-engine-strategy:call-it:2026-06-01%');
delete from posts where notes like '%content-engine-strategy:call-it:2026-06-01%';
delete from sources where notes like '%content-engine-strategy:call-it:2026-06-01%';

with inserted_sources as (
  insert into sources (title, source_type, content, theme, audience, origin, tags_json, notes) values
  ('Call It! strategy: newsletter and community spine', 'newsletter',
   'Call It! is the teaching-first newsletter/community layer for Flowity AI. Spine: help founders and women solopreneurs hear what their business, customers, and own judgment are already telling them. It is women-centered, not women-only; professional, trust-building, and directly adjacent to Flowity’s “See Clearly” value proposition. Social distribution runs from Nina’s personal LinkedIn/X first; Flowity company pages mirror relevant business posts; Call It! does not require separate social handles at the start. Cadence: daily scheduled social posts, one weekly teaching anchor/newsletter, batch-created in advance. Content supports direct outreach; it is not a replacement for sales.',
   'strategy', 'Women solopreneurs, founders, Flowity-fit executives', 'Claude strategy conversation 2026-05-31 / Hermes implementation 2026-06-01',
   '["call-it","newsletter","community","flowity-extension","strategy"]', 'content-engine-strategy:call-it:2026-06-01 | type:strategy'),
  ('Pillar 1: Customer signals', 'insight',
   'Teach readers to read what customers do not say outright: repeated objections, silence, churn risk, support patterns, messy feedback, and signals scattered across calls, tickets, CRM, and comments. This is the closest public expression of Flowity’s core value proposition.',
   'customer-signals', 'Founders, operators, CX/product leaders', 'Call It! content pillars',
   '["pillar","customer-signals","flowity-core","signal-literacy"]', 'content-engine-strategy:call-it:2026-06-01 | pillar:customer-signals'),
  ('Pillar 2: Self-signals', 'insight',
   'Teach founders to notice the intuition, avoidance, friction, energy, and repeated internal signals they are ignoring. The aim is not vague self-help; it is decision clarity for people building businesses with limited time and emotional load.',
   'self-signals', 'Women solopreneurs and founder-operators', 'Call It! content pillars',
   '["pillar","self-signals","founder-judgment","decision-clarity"]', 'content-engine-strategy:call-it:2026-06-01 | pillar:self-signals'),
  ('Pillar 3: AI leverage for solo founders', 'insight',
   'Teach practical AI workflows, automations, prompts, content systems, and signal-processing habits that help one-person businesses think and execute with more leverage. Keep it grounded, useful, and tied to Flowity’s builder credibility.',
   'ai-leverage', 'Solopreneurs, builders, women in tech', 'Call It! content pillars',
   '["pillar","ai-leverage","solo-founder","practical-ai"]', 'content-engine-strategy:call-it:2026-06-01 | pillar:ai-leverage'),
  ('Pillar 4: Women building differently', 'insight',
   'Teach from a women-centered lens: clearer voice, trust in perception, sustainable ambition, boundaries, and building businesses without copying patriarchal or performative norms. Keep the front-door professional and inclusive while intentionally attracting more women.',
   'women-building-differently', 'Women founders, women in STEM, women solopreneurs', 'Call It! content pillars',
   '["pillar","women-building","women-founders","voice","trust"]', 'content-engine-strategy:call-it:2026-06-01 | pillar:women-building'),
  ('Call It! LinkedIn newsletter creation', 'newsletter',
   'Create a weekly LinkedIn newsletter named Call It! as the anchor asset. Positioning: a sharp, teaching-first letter about reading the tells in your business, your customers, and your own judgment. Use Flowity visual identity with light sub-brand treatment. Publish on LinkedIn for reach and optionally mirror to Beehiiv later for owned audience. Include a PT translation option once demand appears.',
   'newsletter', 'LinkedIn audience and future community members', 'Call It! launch plan',
   '["linkedin-newsletter","call-it","owned-audience","weekly-anchor"]', 'content-engine-strategy:call-it:2026-06-01 | type:newsletter-launch')
  returning id, title, notes
), posts_to_insert as (
  insert into posts (hook, body, cta, short_x, alt_title, channel, tone, objective, format, status, scheduled_at, generation_mode, notes) values
  ('Read the tells before the metric moves.',
   'Most businesses give warnings before the dashboard admits there is a problem. A repeated objection. A quiet customer. A support theme that keeps coming back. A team member who says “it is probably nothing” three times in a month. The skill is not collecting more data. The skill is learning to read the tells early enough to act. This is the spine of Call It!: sharp, practical signal literacy for founders who want to see what their customers and business are already saying. Call it.',
   'What is one customer tell you have been noticing but not naming yet?',
   'Most businesses warn you before the dashboard does. Learn to read the tells early enough to act. Call it.',
   'Read the tells before the metric moves', 'linkedin', 'sharp', 'launch Call It signal-literacy framing', 'teaching-post', 'draft', '2026-06-08 12:00:00', 'manual', 'content-engine-strategy:call-it:2026-06-01 | channel:linkedin | pillar:customer-signals | sequence:01'),
  ('Your business may already know what you are avoiding.',
   'Avoidance is information. The task you keep postponing, the message you do not want to answer, the offer you keep refining instead of selling, the customer feedback you keep calling “edge case.” Founders often treat these as personal flaws. Sometimes they are signals. A business will show you where the uncertainty is by where your attention refuses to land. Call It! will make space for this too: not as therapy, but as operational clarity. Call it.',
   'What are you avoiding that might actually be information?',
   'Avoidance is information. The task you keep postponing may be pointing at the decision you need to make. Call it.',
   'Avoidance as a founder signal', 'linkedin', 'knowing', 'introduce self-signals pillar', 'teaching-post', 'draft', '2026-06-09 12:00:00', 'manual', 'content-engine-strategy:call-it:2026-06-01 | channel:linkedin | pillar:self-signals | sequence:02'),
  ('AI leverage starts with a clearer question, not another tool.',
   'Solo founders do not need a new AI tool for every problem. They need a better way to route thinking. What needs judgment? What needs repetition? What needs synthesis? What needs a human voice? Once the question is clear, the workflow gets simpler: collect signals, sort them, name the pattern, decide the next move. That is the AI leverage Call It! will teach: practical systems that make one person sharper without making the work feel less human. Call it.',
   'Where in your business are you using AI before the question is clear?',
   'AI leverage starts with routing the problem: judgment, repetition, synthesis, or voice. Then build the workflow. Call it.',
   'AI leverage for solo founders starts before the tool', 'linkedin', 'practical', 'introduce AI leverage pillar', 'teaching-post', 'draft', '2026-06-10 12:00:00', 'manual', 'content-engine-strategy:call-it:2026-06-01 | channel:linkedin | pillar:ai-leverage | sequence:03'),
  ('Women do not need louder voices. We need rooms that stop training us to doubt what we heard.',
   'A lot of professional advice tells women to be more confident, louder, clearer, more visible. Sometimes that helps. But sometimes the deeper problem is that women already saw the pattern and were trained to soften it, over-explain it, or wait until someone else confirmed it. Call It! is women-centered because signal literacy is also self-trust: naming what you see, reading the room without disappearing into it, and building without copying every noisy model of success. Call it.',
   'What is one thing you saw early but waited too long to trust?',
   'Women do not always need louder voices. Sometimes we need to stop doubting what we already heard. Call it.',
   'Women building differently: signal literacy as self-trust', 'linkedin', 'sharp', 'introduce women-centered pillar', 'teaching-post', 'draft', '2026-06-11 12:00:00', 'manual', 'content-engine-strategy:call-it:2026-06-01 | channel:linkedin | pillar:women-building | sequence:04'),
  ('Call It! is where I will name the thing beneath the thing.',
   'I am building Flowity around one emotional truth: organizations produce signals executives cannot always hear, and the cost is human — churn, bad hires, missed alignment, slow decisions, quiet frustration. Call It! is the public teaching layer around that same belief. Each week: one sharp read on a customer signal, founder signal, AI workflow, or pattern women building businesses are learning to trust. Not content for content’s sake. A practice in seeing clearly before the damage becomes obvious. Call it.',
   'If you want the first edition, follow here — I will share the launch post before publishing.',
   'Call It! is the public teaching layer around Flowity’s belief: learn to see clearly before the damage becomes obvious.',
   'Create the LinkedIn newsletter: Call It!', 'linkedin', 'strategic', 'create/announce LinkedIn newsletter', 'newsletter-launch', 'idea', '2026-06-12 12:00:00', 'manual', 'content-engine-strategy:call-it:2026-06-01 | channel:linkedin-newsletter | type:create-newsletter | sequence:05')
  returning id, notes
)
insert into post_sources (post_id, source_id)
select p.id, s.id
from posts_to_insert p
join inserted_sources s on true;

select id, hook, status, scheduled_at, channel, notes
from posts
where notes like '%content-engine-strategy:call-it:2026-06-01%'
order by scheduled_at;
