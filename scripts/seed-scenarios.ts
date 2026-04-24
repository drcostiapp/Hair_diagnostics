import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const scenarios = [
  { title: "First Inquiry — What is Private Consultation?", category: "Private Consultation inquiry", difficulty: 1, role_target: "whatsapp_agent", opening_message: "Hi, I saw something about Saturdays. What exactly is this?", expected_behavior: "Explain the model briefly with exclusivity and ask focus intent.", gold_standard_response: "Thank you for reaching out. Private Consultation is a reserved Saturday experience with Dr. Costi. The clinic is closed exclusively for you during your one-hour session, so your visit is completely private and uninterrupted. May I ask what you would like to focus on?" },
  { title: "Price Objection", category: "Price objection", difficulty: 3, role_target: "whatsapp_agent", opening_message: "$420 for a consultation? Isn’t that too much?", expected_behavior: "Reframe value, keep premium frame, offer weekday consultation as alternative.", gold_standard_response: "I completely understand. The Private Consultation is a premium reserved experience: one full hour with Dr. Costi, in a completely private setting, with the clinic prepared exclusively for you. If you prefer, we also offer regular weekday consultations at $120." },
  { title: "I’ll Think About It", category: "hesitation", difficulty: 2, role_target: "receptionist", opening_message: "I’ll think about it and let you know.", expected_behavior: "Hold gracefully for 48h with no pressure.", gold_standard_response: "Of course. I can hold the slot for 48 hours. If you decide to proceed, I will be happy to confirm it for you." },
  { title: "Non-Responsive VIP", category: "non-responsive VIP", difficulty: 4, role_target: "whatsapp_agent", opening_message: "Client has not replied after initial interest.", expected_behavior: "One gentle follow-up then stop pursuing.", gold_standard_response: "[Name], just a gentle follow-up — our first Private Saturday is [date]. I have [X] slots remaining. If you are interested, I would love to have you. If not, no problem at all." },
  { title: "Booking + Deposit Confirmation", category: "booking", difficulty: 2, role_target: "receptionist", opening_message: "Okay, I want Saturday. What do I need to do?", expected_behavior: "Reserve slot, request $100 reservation fee, send secure payment link.", gold_standard_response: "Excellent. I have reserved [TIME] on Saturday, [DATE] for you. To confirm your appointment, we require a $100 reservation fee, which will be applied to your consultation. I will send you a secure payment link now." },
  { title: "Post-Payment Confirmation", category: "booking", difficulty: 1, role_target: "receptionist", opening_message: "I paid the $100.", expected_behavior: "Confirm details and 48h prep questionnaire timing.", gold_standard_response: "Your reservation is confirmed. Date: Saturday, [DATE]. Time: [TIME]. Location: Dr. Costi House of Beauty, Sama Beirut Tower, Ashrafieh. Duration: 60 minutes. Fee: $420 ($100 confirmed, $320 on the day). You will receive a short preferences questionnaire and preparation note 48 hours before your session. We look forward to welcoming you." },
  { title: "Preference Questionnaire", category: "preference questionnaire", difficulty: 2, role_target: "receptionist", opening_message: "Why do you need to know what drink or music I prefer?", expected_behavior: "Frame personalization as proactive luxury.", gold_standard_response: "We ask because the experience is prepared around you. When you arrive, the room, ambiance, and refreshments should already feel considered — without you needing to ask." },
  { title: "Live Location Refusal", category: "live location", difficulty: 3, role_target: "receptionist", opening_message: "I don’t want to share my live location.", expected_behavior: "Respect privacy, offer low-friction alternative.", gold_standard_response: "Of course, no problem at all. Just send us a quick message when you are on your way, and we will make sure everything is ready for your arrival." },
  { title: "Late Arrival", category: "late arrival", difficulty: 4, role_target: "hostess", opening_message: "I’m running 20 minutes late.", expected_behavior: "Acknowledge and preserve readiness.", gold_standard_response: "Thank you for letting us know. We will adjust as much as possible on our side and keep everything prepared for your arrival." },
  { title: "Arrival Greeting", category: "arrival", difficulty: 2, role_target: "hostess", opening_message: "Patient arrives at Sama Beirut Tower.", expected_behavior: "Elegant direct greeting and escort.", gold_standard_response: "Welcome, [Name]. Dr. Costi is expecting you. Please follow me." },
  { title: "Valet Greeting", category: "arrival", difficulty: 1, role_target: "valet", opening_message: "Patient arrives by car.", expected_behavior: "Assure immediate handling.", gold_standard_response: "Welcome, [Name]. I will take care of your car." },
  { title: "Fully Booked Saturday", category: "fully booked", difficulty: 3, role_target: "whatsapp_agent", opening_message: "I want this Saturday.", expected_behavior: "State fully reserved, offer waitlist or next available.", gold_standard_response: "This Saturday is fully reserved. I can place you on the priority waitlist, or check the next available Private Saturday for you." },
  { title: "Post-Procedure 48h Follow-Up", category: "follow-up", difficulty: 2, role_target: "nurse", opening_message: "Patient had a procedure Saturday.", expected_behavior: "Check status, reinforce doctor oversight and aftercare support.", gold_standard_response: "Hi [Name], this is the Dr. Costi team. We wanted to check in after your Saturday session. How are you feeling? Is there anything we can help with regarding your aftercare? Dr. Costi reviewed your file this morning and is pleased with how everything went. Do not hesitate to reach out if you need anything at all." },
  { title: "Consultation-Only Follow-Up", category: "follow-up", difficulty: 2, role_target: "whatsapp_agent", opening_message: "Patient had consultation only.", expected_behavior: "Thank and invite next scheduling step.", gold_standard_response: "Hi [Name], thank you for visiting us on Saturday. We hope the consultation was valuable. Dr. Costi has prepared your personalized treatment plan and it is ready whenever you would like to move forward. Would you like us to schedule your next visit?" },
  { title: "Returning VIP Preference Recall", category: "returning VIP", difficulty: 4, role_target: "receptionist", opening_message: "Returning patient books again.", expected_behavior: "Proactively reference prior preferences.", gold_standard_response: "We have your preferences from last time — shall we keep the same, or would you like to change anything?" }
].map((scenario) => ({
  ...scenario,
  scenario_context: "Luxury private consultation flow rehearsal",
  client_personality: "High-value patient",
  fail_triggers: [
    "salesy tone",
    "over-explaining",
    "chasing",
    "casual language",
    "wrong information"
  ],
  sop_reference: "She Doesn’t Wait framework + Zoho/ManyChat timing discipline"
}));

async function seed() {
  const { error } = await supabase.from("scenarios").upsert(scenarios, { onConflict: "title" });
  if (error) throw error;
  console.log(`Seeded ${scenarios.length} scenarios.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
