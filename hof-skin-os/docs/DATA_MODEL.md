# Data Model — Postgres via supabase migrations. UUID pks, created_at/by everywhere.
Conventions: *_version tables are immutable (insert-only); ledgers/audit append-only
via RLS+triggers; enums for all coded fields; FKs on; PII columns flagged for encryption.

staff(id, name, role enum[therapist,admin,medical_director], pin_hash, active)
therapist_authorization(staff_id, module_id?, device_id?, max_intensity)
patient(id, first_name, last_name, dob, sex?, phone, phone_alt?, email?, country, language enum[en,ar,fr], emergency_contact?, created_by)
consent(id, patient_id, category enum S3, granted bool, policy_version, signature_ref, ts)  -- append-only
appointment(id, patient_id, start_ts, duration_min, therapist_id, status enum[booked,checked_in,completed,cancelled,no_show], external_ref?)
visit(id, appointment_id, state enum S1, state_ts jsonb, slot_minutes)
consultation_node(id, parent_id?, question, input_type enum[chips,single,multi,date,text], options jsonb, show_if jsonb, version, active)
consultation_answer(id, visit_id, node_id, node_version, value jsonb)
medical_history_item / medication / allergy / recent_procedure(id, patient_id, code, detail?, date?, source enum[patient,therapist], active)
photograph(id, visit_id, pose enum[front,l45,r45,l90,r90,closeup], phase enum[pre,post], qc jsonb, storage_key, purpose enum[clinical], hash)
ai_observation(id, visit_id, model_id, finding_code, band enum, confidence numeric, regions text[], raw jsonb)
therapist_observation(id, visit_id, finding_code, band, action enum[confirm,modify,reject,add], ai_observation_id?)
skin_assessment(id, visit_id, findings jsonb, skin_type, strengths text[], validated_by, validated_at)  -- the only assessment engines read
treatment_goal(id, visit_id, goal_code, rank)
product(id, brand, name, variant, sku, category enum, supplier?, active)
product_safety_card(id, product_id, version, ...all S18 clinical columns..., status enum[draft,approved], approved_by?, approved_at?)  -- immutable per version
inventory_movement(id, product_id, batch?, expiry?, qty_delta numeric, reason enum[receive,reserve,release,consume,adjust,waste], visit_id?, actor)  -- append-only; stock = SUM
device(id, name, manufacturer, modality, active, operational bool)
device_setting_profile(id, device_id, name, params jsonb, intensity_points, md_approved bool)
treatment_module(id, code, slot enum S9, name, objective_codes text[], intensity_points, minutes, product_options uuid[], device_profile_options uuid[], rule_tags text[], version, active)
protocol(id, visit_id?, template_name?, generated_by enum[engine,template])
protocol_version(id, protocol_id, version, intensity_total, minutes_total, qc_passed bool)
protocol_step(id, protocol_version_id, seq, module_version_ref, product_card_version_ref?, device_profile_ref?, amount?, minutes, tis_breakdown jsonb)
treatment_session(id, visit_id, protocol_version_id, started_at, completed_at?, state enum[active,paused,stopped,complete])
session_event(id uuid client-generated, session_id, seq, type enum[start,step_start,timer_done,pause,resume,modify,skip,reaction,stop,complete,note], payload jsonb, ts, actor)  -- append-only, idempotent on id
reaction(id, session_id, type, severity enum[mild,moderate,severe], engine_response jsonb, escalated bool)
override(id, context enum[rule,recommendation], target_ref, reason_code, by_staff, md_authorized_by?)
treatment_note(id, visit_id, draft jsonb, final_text, signed_by?, signed_at?)  -- immutable after sign; amendments append rows
homecare_recommendation / retail_recommendation / next_visit_recommendation(id, visit_id, payload jsonb, approved_by)
followup(id, visit_id, due_at, channel enum[whatsapp_manual], status enum[due,sent,replied,closed], responses jsonb)
patient_feedback(id, visit_id, skin_feel enum, satisfaction int 1–5)
outcome_score(id, visit_id, components jsonb, score int)
rule(id, code) / rule_version(id, rule_id, version, condition jsonb, effect enum, params jsonb, severity, message, approved_by?, active)
scoring_config(key, value jsonb, version, approved_by)
photo_qc(key, value jsonb)
audit_event(id, actor, entity, entity_id, action, before jsonb?, after jsonb?, ts)  -- append-only, trigger-written on patient/rule/card/protocol/override mutations
