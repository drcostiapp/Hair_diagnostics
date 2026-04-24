-- =============================================================
-- Seed: 30 scenarios (10 categories × 3 difficulty samples)
-- Difficulty 1 = warm/easy, 5 = hostile/VIP under pressure
-- Run after schema.sql. Idempotent-ish: wipes scenarios first.
-- =============================================================
truncate table public.scenarios restart identity cascade;

insert into public.scenarios
  (title, category, difficulty, description, client_persona, opening_message, gold_standard, sop_reference)
values
-- WhatsApp inquiry ----------------------------------------------
('First-time inquiry — curious', 'whatsapp_inquiry', 1,
 'A polite new client asks about your private consultation.',
 'Polite Beiruti woman, mid-30s, new to the clinic, researching options.',
 'Hi, I heard about Dr. Costi. Could you tell me what a private consultation includes?',
 'Thank you for reaching out to Dr. Costi House of Beauty. Dr. Costi''s private consultation is a fully personalised session — one client at a time, by appointment only. May I arrange a time that suits your schedule?',
 'SOP-WA-01 first contact greeting'),

('Inquiry with price probe', 'whatsapp_inquiry', 3,
 'The client asks what''s included and hints at price twice.',
 'Sophisticated returning visitor comparing two clinics.',
 'Hello — what is included in Dr. Costi''s consultation, and how much is it?',
 'With pleasure. A private consultation with Dr. Costi is a one-to-one session, reserved by appointment. Investment is discussed privately during the consultation itself. Would you like me to secure a slot for you this week?',
 'SOP-WA-04 pricing handling'),

('Inquiry from abroad — urgent', 'whatsapp_inquiry', 5,
 'Flying in for 48h, wants an immediate answer with pricing.',
 'GCC-based repeat VIP, expects concierge service, little patience for delays.',
 'I''m flying into Beirut Thursday for two days only. Send me full details, pricing, and first available slot now please.',
 'Welcome back. I will personally reserve Dr. Costi''s earliest private window for you. May I confirm your arrival time so I can hold the most discreet slot? Full details are always shared privately with Dr. Costi at the consultation.',
 'SOP-WA-07 VIP expedited handling'),

-- Price objection ----------------------------------------------
('Soft price objection', 'price_objection', 1,
 'Client says "that''s a bit much" in passing.',
 'Curious new client, polite, testing the waters.',
 'That sounds a bit pricey honestly.',
 'I completely understand. Dr. Costi''s consultation is private and unhurried, which is why our clients invest in it once rather than repeatedly elsewhere. Shall I hold a quiet slot for you?',
 'SOP-PO-02 soft objection reframe'),

('Comparison to another clinic', 'price_objection', 3,
 'Client compares to a cheaper competitor.',
 'Informed shopper, name-drops a rival clinic.',
 'Clinic X does the same thing for half the price. Why is yours double?',
 'A fair question. What Dr. Costi offers is not the same service — it is a private, single-client consultation with the doctor himself, not a technician. Our clients return because of that difference. Would you like to experience it?',
 'SOP-PO-05 competitor reframe'),

('Aggressive discount demand', 'price_objection', 5,
 'VIP demands a 30% discount or will leave.',
 'Entitled high-status client used to getting discounts everywhere.',
 'Give me 30% off or I''m going elsewhere. I refer many people.',
 'I understand, and I appreciate your trust in us. Dr. Costi''s experience is never discounted — it is the same price for every client, which is part of why our most discerning patients respect it. I would be delighted to reserve your slot.',
 'SOP-PO-09 discount refusal, exclusivity'),

-- VIP hesitation -----------------------------------------------
('Soft VIP hesitation', 'vip_hesitation', 2,
 'VIP is warm but drifting away from confirming.',
 'Well-known client, polite, busy, used to being chased.',
 'Let me think about it and come back to you.',
 'Of course. I will hold a provisional slot under your name until tomorrow evening so you have peace of mind. Whenever you are ready, simply reply yes.',
 'SOP-VIP-03 provisional hold'),

('Silent drift after quote', 'vip_hesitation', 4,
 'Client has gone quiet for two days after a warm start.',
 'Private, cautious, avoids commitments until the last moment.',
 '...',
 'A quiet note from Dr. Costi''s team — we kept your preferred Friday window open. No pressure at all; simply let me know if you would like me to release it.',
 'SOP-VIP-06 one-line follow up'),

('High-profile hesitation', 'vip_hesitation', 5,
 'Public figure, worried about discretion.',
 'Celebrity or executive, image-sensitive.',
 'I''m hesitant — I cannot be seen waiting in a lobby with other people.',
 'Your discretion is our standard, not an exception. Dr. Costi sees one client at a time, by private arrival. You will not cross paths with anyone. Shall I arrange it?',
 'SOP-VIP-10 discretion assurance'),

-- Booking confirmation -----------------------------------------
('Standard confirmation', 'booking_confirmation', 1,
 'Confirm tomorrow''s appointment politely.',
 'Returning client, friendly.',
 'Yes, confirmed for tomorrow at 5pm.',
 'Perfect. Your private consultation with Dr. Costi is confirmed tomorrow at 5:00 PM. I will share the arrival details one hour prior.',
 'SOP-BC-01 confirmation template'),

('Last-minute reshuffle', 'booking_confirmation', 3,
 'Client asks to move 30 minutes earlier, same day.',
 'Busy professional juggling meetings.',
 'Can we move it 30 minutes earlier today?',
 'I will check with Dr. Costi''s private schedule and come back within five minutes. One moment please.',
 'SOP-BC-04 same-day changes'),

('Double-booking risk', 'booking_confirmation', 5,
 'Client wants a slot that''s already reserved for another VIP.',
 'High-maintenance VIP, insistent.',
 'I want 6pm Saturday. Confirm now.',
 'That particular window is held for another private client. May I offer you Saturday at 5:15 PM or 7:00 PM — both are fully private and reserved only for you.',
 'SOP-BC-07 protected slot protocol'),

-- Live location request ----------------------------------------
('Polite location ask', 'live_location_request', 1,
 'Client asks for the address 20 minutes before arrival.',
 'Punctual, organised.',
 'Could you share the location please?',
 'With pleasure. Sharing the private entrance pin now. The valet will meet you on arrival under your name.',
 'SOP-LL-01 address share'),

('Late-night address ask', 'live_location_request', 3,
 'Client asks for the address at 11pm for a tomorrow slot.',
 'Anxious, wants to plan ahead.',
 'Send me the address now so I don''t get lost tomorrow.',
 'Of course. I will send the live location and private entrance details one hour before your slot, so the directions are fresh. You will never be lost — the valet meets you at the gate.',
 'SOP-LL-03 timing discipline'),

('Driver is lost on arrival', 'live_location_request', 5,
 'Client''s driver is circling the block, client is frustrated.',
 'VIP in the car, visibly annoyed.',
 'My driver can''t find it. This is ridiculous.',
 'I am so sorry. Please stay on the line — our valet is walking out to you now and will guide your driver in directly. You will be inside in under two minutes.',
 'SOP-LL-06 live recovery'),

-- Arrival issue ------------------------------------------------
('Parking confusion', 'arrival_issue', 1,
 'Client asks where to park.',
 'Calm, first-time visitor.',
 'Where do I park?',
 'Our valet is waiting for you at the private entrance. Simply hand him the keys — he will take care of everything.',
 'SOP-AR-01 valet protocol'),

('Wrong entrance', 'arrival_issue', 3,
 'Client went to the main lobby instead of the private entrance.',
 'Slightly embarrassed, in a hurry.',
 'I''m at reception downstairs — they don''t seem to know who I am.',
 'That is our fault for not being clearer. Please walk back out and our hostess will meet you at the private entrance in thirty seconds. She knows you are on the way.',
 'SOP-AR-04 recovery script'),

('VIP kept waiting', 'arrival_issue', 5,
 'VIP has been standing at the door for 4 minutes — no one greeted them.',
 'Furious VIP, texts in full caps.',
 'I''M AT THE DOOR. NO ONE IS HERE. THIS IS UNACCEPTABLE.',
 'My sincerest apologies — this is not how we receive you. Our hostess is opening the door for you now. Dr. Costi has been informed personally and will welcome you himself.',
 'SOP-AR-09 luxury recovery'),

-- Late client --------------------------------------------------
('Ten minutes late', 'late_client', 1,
 'Client will be 10 minutes late and apologises.',
 'Polite, apologetic.',
 'I''m running ten minutes late, so sorry.',
 'Not at all. Dr. Costi will be ready whenever you arrive. Please drive safely.',
 'SOP-LT-01 warm reassurance'),

('Thirty minutes late — no notice', 'late_client', 3,
 'Client shows up 30 minutes late without warning.',
 'Awkward, over-explains.',
 'Traffic was insane, sorry I didn''t text.',
 'Welcome — your private room is ready. Dr. Costi will be with you in a moment. No explanation needed.',
 'SOP-LT-04 no-judgement script'),

('Late and demanding priority', 'late_client', 5,
 'Client is 45 minutes late and demands to still be seen before the next client.',
 'Entitled, pushy.',
 'I''m 45 min late but you have to take me now before anyone else.',
 'I understand. Allow me one moment — Dr. Costi''s schedule is built around one client at a time. I will speak with him personally and come back with the earliest private window tonight.',
 'SOP-LT-08 schedule protection'),

-- Post-visit follow-up -----------------------------------------
('Warm thank-you', 'post_visit_follow_up', 1,
 'Send a gentle thank-you 24h after the visit.',
 'Happy client, just left.',
 '[system: send 24h follow-up]',
 'It was a pleasure hosting you at Dr. Costi House of Beauty yesterday. Dr. Costi sends his personal regards. We are here whenever you need us.',
 'SOP-PV-01 24h touchpoint'),

('Mild dissatisfaction surfaced', 'post_visit_follow_up', 3,
 'Client replies they felt rushed.',
 'Polite but honest.',
 'Honestly I felt a bit rushed at the end.',
 'Thank you for telling me — that is not how we wish you to feel. I will share this personally with Dr. Costi today. May I invite you back for a private follow-up, with his compliments?',
 'SOP-PV-05 recovery protocol'),

('Public negative review threat', 'post_visit_follow_up', 5,
 'Client hints at posting a bad review.',
 'Frustrated, influential.',
 'I''m thinking of writing about my experience online.',
 'Please allow us the chance to make it right before anything public. Dr. Costi himself would like to speak with you — may I arrange a private call today?',
 'SOP-PV-09 reputation recovery'),

-- Referral conversation ----------------------------------------
('Offhand referral mention', 'referral_conversation', 1,
 'Client mentions a friend might be interested.',
 'Warm regular.',
 'My friend asked me where I go — she might reach out.',
 'That means a great deal to us. Whenever she is ready, she can write to this same number and I will take personal care of her.',
 'SOP-RF-01 warm referral handoff'),

('Referral asking for a favour', 'referral_conversation', 3,
 'Client wants a discount for their referred friend.',
 'Well-meaning but pushing.',
 'Can you do something special for my friend since I sent her?',
 'The most special thing we can do is receive her the way we receive you — fully private, unhurried, with Dr. Costi personally. That is the gift.',
 'SOP-RF-04 value preservation'),

('VIP referring a public figure', 'referral_conversation', 5,
 'VIP is referring a celebrity who requires extreme discretion.',
 'Protective of their referred contact.',
 'I''m sending someone very well known. I need full discretion.',
 'Understood completely. Please share her preferred name and timing privately — I will reserve a closed slot with no overlap, and only Dr. Costi will know.',
 'SOP-RF-07 discreet referral'),

-- Fully booked Saturday ----------------------------------------
('Polite Saturday request', 'fully_booked_saturday', 1,
 'Client asks for a Saturday slot, but Saturday is full.',
 'Flexible, polite.',
 'Can I come Saturday afternoon?',
 'Saturday is fully reserved this week. I can offer you Friday evening or Monday morning — both are private windows with Dr. Costi.',
 'SOP-FB-01 Saturday redirect'),

('Insistent Saturday request', 'fully_booked_saturday', 3,
 'Client insists on Saturday despite being told it''s full.',
 'Busy executive with a narrow window.',
 'Saturday is the only day I can. Make it happen.',
 'I hear you. Saturday is fully reserved, and Dr. Costi protects that schedule personally. May I place you first on Saturday''s private waitlist and hold Friday evening as your confirmed backup?',
 'SOP-FB-04 waitlist protocol'),

('VIP demanding a Saturday exception', 'fully_booked_saturday', 5,
 'VIP demands Dr. Costi open a Saturday slot outside normal hours.',
 'Used to rules bending, testing the clinic.',
 'Open up a slot Saturday for me. I know you can.',
 'Your loyalty means a great deal. Saturday is kept private even from me — Dr. Costi has reserved that day by design. I will personally secure your earliest alternative window, entirely yours.',
 'SOP-FB-09 exclusivity under pressure');
