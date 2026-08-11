# Clinical Specification — implementation numbers (MD-approved defaults)
Rationale lives in ARCHITECTURE.md. Everything here is data the engines load;
weights/thresholds are seeded into scoring_config and editable by the Medical Director.

## S1 Workflow states (visit)
scheduled → checked_in → consultation → photography → ai_review → validated →
safety_screened → goals_set → protocol_generated → protocol_approved → in_treatment
→ (stopped) → post_assessment → documented → closed. Escalation may pause any state.

## S2 Roles & RLS intent
THERAPIST: read/write own visits, patients, sessions; read approved cards/rules/modules; no audit, no config, no cost fields.
ADMIN: + products, inventory, devices, question graph, staff, analytics; no rule approval.
MEDICAL_DIRECTOR: + rule/card/module approval, scoring_config, overrides review, escalations.
PATIENT_DISPLAY: no auth identity; a UI mode of the therapist session, never a DB role.
Append-only (INSERT only, no UPDATE/DELETE for any role): session_event, inventory_movement, audit_event, consent.

## S3 Consent categories
treatment · clinical_photography · ai_analysis · data_storage · marketing_photography (separate moment, default absent). Store policy_version + signature ref per grant.

## S4 Intake seed
Concerns (multi-select): dryness, dehydration, dullness, acne, breakouts, congestion, blackheads, enlarged_pores, oiliness, pigmentation, melasma, PIH, uneven_tone, redness, sensitivity, rosacea_tendency, rough_texture, fine_lines, wrinkles, firmness_loss, laxity, under_eye_darkness, puffiness, sun_damage, post_acne_marks, other. Then the single Patient Priority question.
Actives (with last-use where flagged*): retinol*, retinal*, tretinoin*, adapalene*, AHA*, BHA*, glycolic*, lactic*, mandelic*, salicylic*, vitamin_c, hydroquinone, azelaic, benzoyl_peroxide, niacinamide, peptides, growth_factors, exosomes, prescription_derm*, other.
Medical: pregnancy, breastfeeding, herpes_cold_sores, eczema, dermatitis, psoriasis, rosacea_dx, active_acne, allergies(list), autoimmune, immunosuppressed, keloids, abnormal_scarring, skin_infection, open_wounds, anticoagulants, photosensitizing_meds, isotretinoin_current, isotretinoin_last_6mo, steroids, antibiotics.
Recent procedures (with date): facial, chemical_peel, laser, IPL, microneedling, RF, morpheus8, injectables, surgery, waxing, threading, dermaplaning, sunburn, heavy_sun, tanning.
Conditional children per ARCHITECTURE §2.4 (e.g., retinoid → which/frequency/last use).

## S5 Finding codes + bands
oiliness, dehydration, pore_visibility, texture, redness, pigmentation, tone_irregularity, dullness, acne_lesions, comedones, fine_lines, wrinkles, sun_damage, under_eye_darkness, puffiness, inflammation, sensitivity_signs, barrier_stress.
Bands: low | mild | moderate | high. Confidence 0–1; threshold requiring forced therapist action: 0.65 (scoring_config: ai_confidence_min).

## S6 AI structured output (Worker returns exactly this JSON)
{ skin_type_estimate: "dry|oily|combination|normal|sensitive",
  findings: [{ code, band, confidence, regions: ["forehead|cheeks_l|cheeks_r|nose|chin|perioral|periorbital|jawline|neck"] }],
  strengths: [string≤6 words, max 3],
  escalation: { required: boolean, reason?: string },
  summary_patient_safe: string ≤50 words (S14 language rules) }
Model call: Anthropic Messages API, temperature ≤0.2, images = the QC-passed poses, system prompt constrains codes to S5 and forbids diagnosis/medical terms; invalid JSON → one retry → manual-assessment fallback.

## S7 Photo QC thresholds (defaults; config table photo_qc)
face detected & landmarks confidence ≥0.8 · face box 40–70% of frame height · yaw within ±8° of target pose (0°/±45°) · sharpness: Laplacian variance ≥ 120 · mean luma 90–190 with clipped pixels <2% · no obstruction over T-zone/cheeks (hair/glasses heuristic). Fail → specific retake message.

## S8 Hard rules R1–R25 (seed rule_version rows; JSON-logic conditions over intake/assessment/product/device fields)
R1 pregnancy|breastfeeding → EXCLUDE products with salicylate|retinoid codes, RF, electrical_stim; RESTRICT peels to md_approved_pregnancy list
R2 isotretinoin_current|last_6mo → EXCLUDE all chemical peels, dermaplaning, mechanical exfoliation, needling; REQUIRE_MD beyond gentle/hydration modules
R3 peel|laser|IPL|microneedling ≤14d → EXCLUDE exfoliation+energy slots; RESTRICT to barrier protocol
R4 same 15–28d → RESTRICT intensity_budget_cap 30
R5 prescription retinoid ≤72h → EXCLUDE professional AHA/BHA application; RESTRICT exfoliation to enzyme
R6 herpes flare active → EXCLUDE perioral field treatment; ESCALATE
R7 open_wounds|skin_infection → EXCLUDE affected area; ESCALATE
R8 allergen match (patient allergy ∩ card allergen codes) → EXCLUDE product — NO override path
R9 anticoagulants → EXCLUDE deep_extraction; RESTRICT suction to low
R10 photosensitizing_meds → EXCLUDE photo-reactive acids; homecare adds strict-sun lines
R11 active sunburn → EXCLUDE exfoliation+energy; barrier protocol only
R12 rosacea_dx|rosacea_tendency(high) → EXCLUDE high-heat + aggressive mechanical; RESTRICT acids to azelaic|mandelic class
R13 keloids|abnormal_scarring → EXCLUDE needling class without REQUIRE_MD
R14 autoimmune|immunosuppressed → REQUIRE_MD for needling + energy devices
R15 escalation.required (AI or therapist lesion flag) → ESCALATE, pause pathway
R16 card expired|batch quarantined → EXCLUDE (system rule, not editable) — NO override
R17 stock < required qty → EXCLUDE from primary; substitution engine engages
R18 therapist lacks authorization for module/device → EXCLUDE from executable set; show "Authorized therapist required"
R19 >1 acid-based professional step in one protocol → RESTRICT to one; next becomes alternate
R20 same-family treatment ≤21d → RESTRICT intensity_budget −15
R21 eczema|dermatitis active → EXCLUDE exfoliation; barrier protocol
R22 waxing|threading|dermaplaning ≤48h → RESTRICT: no acids on treated zones
R23 injectables ≤14d → EXCLUDE massage|suction|RF over zones; REQUIRE_MD otherwise
R24 age <18 → REQUIRE_MD pathway + guardian consent variant
R25 prior severe reaction to product X → EXCLUDE X; RESTRICT its family pending MD review

## S9 TIS (per eligible module, 0–100) — weights in scoring_config
+ clinical_need_match ≤35 (validated findings ↔ module objectives, severity-weighted)
+ patient_priority_match ≤15 · prior_response −10..+15 · compatibility_fit ≤10
+ protocol_synergy ≤10 · operational_fit ≤5
− sensitivity_risk ≤20 · − recency_proximity ≤20 · − ingredient_soft_conflict ≤15
Thresholds: ≥70 primary · 50–69 alternate · <50 hidden.
Assembly: slot order prep→exfoliation→congestion→correction→hydration→device→recovery→protection; greedy highest-TIS per needed slot s.t. Σintensity ≤ budget, Σminutes ≤ slot_length, each top-2 goal covered, no pairwise conflicts; recovery slot mandatory when Σintensity > 40. Skip slots not serving today's goals.

## S10 Intensity + BRS
Points: cleanse 0–2 · led 2 · cryo 4 · ultrasound_infusion 5 · electroporation 6 · enzyme 8 · microcurrent 8 · gommage 10 · light_extraction 10 · hydroderm 12 · dermaplaning 15 · bha_peel 18 · aha_mild 20 · deep_extraction 20 · rf_thermal 25 · aha_strong 28 · needling_class 30 · recovery/protection 0 (they gate; never subtract).
BRS factors: rx_retinoid ≤72h +25 (4–7d +12) · otc_retinol ≤72h +15 · home acids ≤48h +15 · pro peel/laser/needling ≤14d +30 (15–28d +15) · visible erythema +15 · dryness/flaking +15 · self-reported sensitivity +10 · dermatitis history +15 · sunburn +35.
Budgets: BRS 0–20 → 65 · 21–45 → 40 · ≥46 → 25 + auto barrier-restoration pivot. Display bands: ≤30 Gentle · 31–60 Moderate · 61–80 Intensive · ≥81 Review.

## S11 Module seed (id · slot · name · objectives · pts · min)
M01 prep gentle_double_cleanse cleanse 2 7 · M02 prep deep_cleanse_degrease cleanse,oiliness 3 7
M03 exfo enzyme_exfoliation dullness,texture 8 8 · M04 exfo gommage dullness,texture 10 8
M05 exfo hydrodermabrasion congestion,texture,dullness 12 10 · M06 exfo dermaplaning texture,dullness 15 15
M07 exfo bha_peel acne,congestion,oiliness 18 10 · M08 exfo aha_peel_mild dullness,pigmentation,texture 20 10
M09 exfo aha_peel_strong pigmentation,texture 28 12 · M10 cong steam_soften congestion 2 5
M11 cong light_extraction comedones 10 10 · M12 cong deep_extraction comedones,congestion 20 15
M13 corr brightening_infusion_b3_azelaic pigmentation,tone,redness 5 8
M14 corr antioxidant_vitc dullness,tone,sun_damage 6 8 · M15 corr acne_targeted acne 8 8
M16 corr calming_antiinflammatory redness,sensitivity 3 8
M17 hydr ha_serum_infusion dehydration 5 8 · M18 hydr hydrating_mask dehydration,dullness 3 12
M19 hydr peptide_collagen_mask fine_lines,firmness 3 12
M20 dev led_red firmness,inflammation 2 10 · M21 dev led_blue acne 2 10
M22 dev ultrasound_infusion (carrier for corr/hydr serums) 5 8 · M23 dev electroporation (carrier) 6 8
M24 dev microcurrent firmness,puffiness 8 12 · M25 dev rf_tightening laxity,firmness 25 15
M26 reco barrier_repair_mask barrier_stress,redness 0 10 · M27 reco cryo_calm redness,puffiness 4 5
M28 prot moisturizer_seal — 0 3 · M29 prot spf50 — 0 2 · M30 corr eye_treatment under_eye_darkness,puffiness 1 6
Product options per module bind to approved safety cards at import (T07/T14); until then, fixture cards only.

## S12 Reaction responses
mild erythema/warmth → log; downgrade pending acid steps to alternates; continue
moderate erythema/burning/stinging → cancel remaining exfoliation+acid+heat; insert M16+M26; devices → minimum or skip; homecare adds recovery lines; queue 24h follow-up
severe pain/swelling/wheals/blistering/spreading rash → STOP state; incident record (mandatory fields+photo); ESCALATE notification; block close until MD ack; mandatory 24h follow-up
mild itching/tingling → 60s observe timer; persists → treat as moderate

## S13 Homecare rule table (performed module family → lines, day counts)
any professional exfoliation (M03–M09) → "No retinoids or exfoliating acids for 4 days" · "No sauna/steam 48h" · "SPF 50 daily, reapply midday"
strong peel (M08–M09) → extend actives pause to 7 days · "Expect light flaking; do not pick"
extraction (M11–M12) → "No makeup 12h" · "No touching treated areas today"
RF/thermal (M25) → "No heat exposure (sauna/hot yoga) 24h"
needling class → "No actives 5 days · no makeup 24h · SPF strict"
all visits → AM: cleanser → treatment(if any) → moisturizer → SPF · PM: cleanser → treatment → moisturizer. Max 4 lines per section.

## S14 Patient-mode language
Band→phrase: high dehydration → "your skin is asking for deep hydration today" · moderate pigmentation → "we're gently evening your tone" · pattern: describe need, never deficiency. Strengths first when genuine. Banned in patient view: numbers/scores/percentages, "anti-aging" (use "skin longevity"), risk/contraindication wording, product costs, AI mentions, superlatives ("dramatic","miracle"). Approved microcopy: (1) "Your skin assessment is complete. Today's facial will now be composed around what your skin needs right now." (2) "This treatment was designed for your skin as it is today — not from a menu." (3) "Your skin record has been updated. Your next visit will build on what we achieved today."

## S15 Brand tokens
brand.gold #D3B57C · brand.linen #DBCCBB · brand.taupe #B7A188 · brand.bronze #84735F · brand.navy #0E2A37. Headlines Optima (system fallback stack), body Raleway. Public naming: "Dr. Costi" only — the studio surface says "Dr. Costi House of Facials"; never "House of Beauty" in any patient-facing string.

## S16 Pre-start validation checklist (all true → START FACIAL enabled)
patient identified · required consents present · assessment validated · safety screen complete with no unresolved RED in plan · therapist authorized for every step · every product card approved+non-expired · stock available (post-T26: reserved) · Σintensity ≤ budget · Σminutes ≤ slot · top-2 goals covered.

## S17 Engine test fixtures (must stay green forever)
F1 "Leila": 36F, combination, no allergies, not pregnant; retinol last used 48h; findings: dullness high, pore_visibility high, pigmentation moderate, redness moderate, under_eye_darkness moderate; priority dullness. EXPECT: BRS=30, budget=40; M08 aha_mild TIS<50 (hidden); M05 hydroderm selected for exfo slot; final protocol Σintensity ≤40; includes a correction step addressing pigmentation with non-acid actives; M26 or M16 present.
F2 pregnancy: EXPECT every salicylate/retinoid-coded card EXCLUDED, RF EXCLUDED, generator still returns a valid gentle protocol.
F3 isotretinoin_current: EXPECT all peels/mechanical exfoliation/needling EXCLUDED; only gentle/hydration modules eligible without MD flag.
F4 severe reaction mid-session: EXPECT remaining steps voided, state=stopped, incident required, close blocked until MD ack event.

## S18 Safety Card workbook columns (importer contract, one row per product)
brand · product_name · variant_size · sku · category(professional|retail|consumable) · unit_cost · pack_qty · supplier · actives(list code:pct?) · ph_class(acidic|neutral|alkaline|na) · indications(codes) · contraindication_codes · allergen_codes · application_method · application_amount · application_minutes · removal · incompatible_ingredient_codes · incompatible_device_ids · intensity_points · pregnancy_safe(y|n|md) · status(draft|approved) · notes
Importer rejects rows with missing brand/product_name or unknown codes; nothing imports silently.
