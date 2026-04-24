-- ─────────────────────────────────────────────────────────────
-- Dr. Costi Experience Simulator — Scenario Seed
-- Safe to re-run: inserts are gated on title uniqueness per run.
-- ─────────────────────────────────────────────────────────────

insert into public.scenarios
  (title, category, difficulty, role_target, scenario_context, client_personality,
   opening_message, expected_behavior, gold_standard_response, fail_triggers, sop_reference)
values
-- 1
('First Inquiry — "What is Private Consultation?"',
 'Private Consultation inquiry', 1, 'whatsapp_agent',
 'A prospect has seen a post about Private Saturdays and is asking what the experience is. First contact.',
 'Elegant, curious, quiet.',
 'Hi, I saw something about Saturdays. What exactly is this?',
 'Explain briefly that the clinic is reserved for one patient for a full hour with Dr. Costi. End with a soft qualifying question. No price yet unless asked.',
 'Thank you for reaching out. Private Consultation is a reserved Saturday experience with Dr. Costi. The clinic is closed exclusively for you during your one-hour session, so your visit is completely private and uninterrupted. May I ask what you would like to focus on?',
 array['Leading with price','Listing features like a brochure','Casual slang','Emoji overuse'],
 'Private Consultation SOP — Inquiry Script'),

-- 2
('Price Objection',
 'Price objection', 3, 'whatsapp_agent',
 'Prospect knows the $420 fee and pushes back on the price.',
 'Direct, skeptical, price-sensitive.',
 '$420 for a consultation? Isn''t that too much?',
 'Reframe the value without discounting. Offer the regular $120 weekday consultation as a parallel option, not a downgrade.',
 'I completely understand. The Private Consultation is a premium reserved experience: one full hour with Dr. Costi, in a completely private setting, with the clinic prepared exclusively for you. If you prefer, we also offer regular weekday consultations at $120.',
 array['Discounting','Apologising for the price','Over-justifying','Pressuring'],
 'Private Consultation SOP — Objection Handling'),

-- 3
('"I''ll Think About It"',
 'hesitation', 2, 'whatsapp_agent',
 'Prospect hesitates after seeing all details.',
 'Polite but non-committal.',
 'I''ll think about it and let you know.',
 'Acknowledge without chasing. Offer a 48-hour soft hold. Do not follow up aggressively.',
 'Of course. I can hold the slot for 48 hours. If you decide to proceed, I will be happy to confirm it for you.',
 array['Chasing','Adding urgency','Begging','Sending multiple messages'],
 'Private Consultation SOP — Hesitation Response'),

-- 4
('Non-Responsive VIP',
 'non-responsive VIP', 4, 'whatsapp_agent',
 'Client expressed interest but has not replied in 48 hours.',
 'Silent, possibly observing.',
 '[Client has not replied for 48 hours after the original inquiry.]',
 'Send exactly one gentle follow-up. If no response, stop. Luxury does not pursue.',
 '[Name], just a gentle follow-up — our first Private Saturday is [date]. I have [X] slots remaining. If you are interested, I would love to have you. If not, no problem at all.',
 array['Repeated pings','Multiple follow-ups','Sounding anxious','Offering discount to bring them back'],
 'Private Consultation SOP — Non-Response Rule'),

-- 5
('Booking + Deposit Confirmation',
 'booking', 2, 'receptionist',
 'Client has decided to book and is asking how to confirm.',
 'Decisive, ready to pay.',
 'Okay, I want Saturday. What do I need to do?',
 'Confirm slot, explain $100 reservation fee is applied to consultation, send payment link. Keep it short.',
 'Excellent. I have reserved [TIME] on Saturday, [DATE] for you. To confirm your appointment, we require a $100 reservation fee, which will be applied to your consultation. I will send you a secure payment link now.',
 array['Forgetting the fee-application detail','Using vague booking language','Asking too many questions'],
 'Private Consultation SOP — Booking & Deposit'),

-- 6
('Post-Payment Confirmation',
 'booking', 1, 'receptionist',
 'Client has just paid the $100 deposit.',
 'Relieved, expecting a clean confirmation.',
 'I paid the $100.',
 'Send a clean, complete confirmation: date, time, location, duration, fee breakdown, 48h questionnaire notice. No fluff.',
 'Your reservation is confirmed. Here are the details:\n\nDate: Saturday, [DATE]\nTime: [TIME]\nLocation: Dr. Costi House of Beauty, Sama Beirut Tower, Ashrafieh\nDuration: 60 minutes\nFee: $420 ($100 confirmed, $320 on the day)\n\nYou will receive a short preferences questionnaire and preparation note 48 hours before your session. We look forward to welcoming you.',
 array['Missing the 48h questionnaire notice','Omitting address','Incorrect fee breakdown'],
 'Private Consultation SOP — Confirmation Message'),

-- 7
('Preference Questionnaire',
 'preference questionnaire', 2, 'receptionist',
 'Client received the 48h pre-visit questionnaire and questions why.',
 'Curious, slightly guarded.',
 'Why do you need to know what drink or music I prefer?',
 'Frame the questionnaire as preparation, not nosiness. Emphasise that on arrival everything is already considered.',
 'We ask because the experience is prepared around you. When you arrive, the room, ambiance, and refreshments should already feel considered — without you needing to ask.',
 array['Sounding clinical','Using marketing language','Defensive tone'],
 'Private Consultation SOP — Preference Questionnaire'),

-- 8
('Live Location Refusal',
 'live location', 3, 'receptionist',
 'Morning of appointment. Client declines to share live location.',
 'Private, protective.',
 'I don''t want to share my live location.',
 'Accept instantly. Offer the fallback: a quick on-the-way message. Do not repeat the request.',
 'Of course, no problem at all. Just send us a quick message when you are on your way, and we will make sure everything is ready for your arrival.',
 array['Insisting','Explaining why the clinic needs it','Sounding disappointed'],
 'Private Consultation SOP — Live Location Protocol'),

-- 9
('Late Arrival',
 'late arrival', 4, 'receptionist',
 'Client messages that she is 20 minutes late.',
 'Slightly stressed, apologetic.',
 'I''m running 20 minutes late.',
 'Calm reassurance. No judgement. Signal that the team is adapting around her.',
 'Thank you for letting us know. We will adjust as much as possible on our side and keep everything prepared for your arrival.',
 array['Sounding frustrated','Reminding her the session is shortened','Over-explaining'],
 'Private Consultation SOP — Late Arrival'),

-- 10
('Arrival Greeting',
 'arrival', 2, 'hostess',
 'Patient has just arrived at Sama Beirut Tower and walked into the lobby.',
 'Expecting to be recognised.',
 '[Patient arrives at Sama Beirut Tower lobby.]',
 'Greet by name in one short line. Do not explain. Lead the way immediately.',
 'Welcome, [Name]. Dr. Costi is expecting you. Please follow me.',
 array['Asking if they have an appointment','Small talk','Looking confused','Failing to use her name'],
 'Arrival SOP — Hostess Greeting'),

-- 11
('Valet Greeting',
 'arrival', 1, 'valet',
 'Patient has just driven up to the tower entrance.',
 'Expecting a seamless hand-off.',
 '[Patient pulls up in her car.]',
 'One calm line. Take the keys. No small talk. Signal the hostess.',
 'Welcome, [Name]. I will take care of your car.',
 array['Asking her name','Delaying','Casual greeting'],
 'Arrival SOP — Valet Hand-off'),

-- 12
('Fully Booked Saturday',
 'fully booked', 3, 'whatsapp_agent',
 'Client asks for a Saturday that is already fully reserved.',
 'Disappointed, slightly impatient.',
 'I want this Saturday.',
 'State the truth cleanly. Offer priority waitlist or the next Private Saturday. Do not over-apologise.',
 'This Saturday is fully reserved. I can place you on the priority waitlist, or check the next available Private Saturday for you.',
 array['Over-apologising','Offering a weekday slot as a downgrade without framing','Sounding defeated'],
 'Private Consultation SOP — Capacity Rule'),

-- 13
('Post-Procedure 48h Follow-Up',
 'follow-up', 2, 'whatsapp_agent',
 '48 hours after a Saturday procedure. Proactive check-in.',
 'Recovering, paying attention to details.',
 '[Patient had a procedure last Saturday. This is the 48-hour proactive follow-up.]',
 'Warm, specific, and signals that Dr. Costi personally reviewed her file.',
 'Hi [Name], this is the Dr. Costi team. We wanted to check in after your Saturday session. How are you feeling? Is there anything we can help with regarding your aftercare? Dr. Costi reviewed your file this morning and is pleased with how everything went. Do not hesitate to reach out if you need anything at all.',
 array['Generic "how are you" with nothing personalised','Forgetting the file-review detail','Asking for a review or referral'],
 'Post-Visit SOP — 48h Procedure Follow-Up'),

-- 14
('Consultation-Only Follow-Up',
 'follow-up', 2, 'whatsapp_agent',
 'Patient had a consultation only, no procedure.',
 'Evaluating, may or may not book.',
 '[Patient had a consultation only. This is the follow-up.]',
 'Warm, brief. Mention that the personalised plan is ready. Soft invitation to schedule.',
 'Hi [Name], thank you for visiting us on Saturday. We hope the consultation was valuable. Dr. Costi has prepared your personalized treatment plan and it is ready whenever you would like to move forward. Would you like us to schedule your next visit?',
 array['Pushing to book','Listing services','Sounding sales-y'],
 'Post-Visit SOP — Consultation-Only Follow-Up'),

-- 15
('Returning VIP Preference Recall',
 'returning VIP', 4, 'receptionist',
 'Returning patient is booking again. The system remembers her preferences.',
 'Discerning, used to being known.',
 '[Returning patient books her next Private Saturday.]',
 'Demonstrate memory without reading out the full list. Offer her the choice to keep or change.',
 'We have your preferences from last time — shall we keep the same, or would you like to change anything?',
 array['Asking her preferences from scratch','Listing them out aloud','Failing to signal recognition'],
 'Returning Patient SOP — Preference Recall')
on conflict do nothing;
