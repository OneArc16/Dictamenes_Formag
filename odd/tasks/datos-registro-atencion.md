# Snapshot of patient, physician and site data on attention finalization
Branch: origen · Delivery: work-unit commits on the current branch; no push or PR
Test runner: node --import tsx --test (package.json `test:atenciones`), eslint, tsc (6 pre-existing missing-module errors), prisma migrate

## Specs

### S1 — Keep the data as signed
User request (L1): "Te confirmo" — confirming the proposal: "al finalizar la atención, guardar una copia de los datos del paciente y del médico, igual que ya se hace con los antecedentes. La pantalla y los PDF usarían esa copia, y las atenciones viejas que no la tienen seguirían leyendo los datos actuales."

Acceptance criteria:
- New nullable JSON column on `atenciones` holding patient identification (name, document, birth date, stored age, sex, civil status, address, phone, EPS, cargo, secretaría, institución, ethnicity, zone), physician (name, document, medical registration, licence, signature image) and site (habilitation code, address, phone, city).
- Written inside the existing finalization transaction (`attendAppointment`), next to the antecedentes snapshot.
- Attention screen and printed HC/remisión/incapacidad read the snapshot when present; attentions without it keep reading current data.
- Later edits of a finalized attention by its physician do not change the snapshot.
- Age keeps being computed at the attention date from the snapshot birth date.

### S2 — Age on the attention screen at the attention date
User confirmation (L1) of: "Pantalla de la atención: … tiene que mostrar la edad de ese día."

## Tasks

- T1 (S2): attention screen age at attention date. Route: inline. Status: done (commit 09f6768).
- T2 (S1): domain snapshot type/parse + builder from live records (tests), migration, write on finalize, read in detail and print loader. Route: inline (single unit; no writer reason). Risk: item 1 (persisted format, migration). Status: complete (see L4-L5); independent verifier PASS.

## Log

L1 (2026-11-02): "Te confirmo" — answer to: "¿Corrijo ya la edad en la pantalla (punto 2) y dejo la copia de datos (punto 3) para cuando me confirmes?"
L2: Evidence: finalization already snapshots antecedentes, revisión and examen (`attend-appointment.ts:60-77`). Patient demographics, physician (signature, registration, licence) and site data are read live in `atencion-detail.ts` and `documentos-clinicos-print.ts`.
L3: Decision: no backfill for already finalized attentions (backfilling would freeze today's data as if it were the signed one); they keep reading current data.
L4 (2026-11-02): T2 done. Domain `datos-registro.ts` (schema v1 + tolerant parse, 2 tests); application `datos-registro.ts` (`toDatosRegistro`/`pacienteRegistro` from live records, `datosRegistroActuales`, `datosRegistroDeAtencion` snapshot-or-live; 1 test). Migration `20261102050000_atencion_datos_registro` adds nullable JSONB `atenciones.datos_registro` (written by hand: `migrate dev` asked to reset the drifted local DB; applied with `migrate deploy`, DB diff clean for `atenciones`). Written in `attendAppointment` transaction; read by `getAtencionDetalle` (finalized only) and `loadDocumentoClinicoExtras` (replaces its own live query). Checks: test:atenciones 79/79, test:reception 16/16, test:origen 15/15, eslint clean, tsc no new errors. Local DB end-to-end on cita 1: without snapshot live data; with a modified snapshot screen EPS and PDF licence came from the snapshot; column restored to NULL. HC render of cita 1 without snapshot: only the print timestamp line differs.
L5 (2026-11-02): Independent verifier: PASS for S1 and S2, no blockers. Advisory fixed: the physician name had switched to the screen-style join (collapsing inner double spaces), an unrequested printed-output change; restored the original per-part trim for the physician, patient keeps the screen join; +1 regression test. Advisory kept: no automated test for snapshot-vs-live selection in detail/print loader or for the finalize write (covered by the L4 end-to-end check). test:atenciones 80/80, eslint clean, tsc no new errors.
L6 (2026-11-02): Native review (lenses risk, reliability) granted by the user, approved and acknowledged (lineage review-e7fc36de97ba1713, authority burned). Non-blocking findings: R3 WARNING no test for snapshot-vs-live selection -> added `datosRegistroDeAtencion` test with a stub db (81/81); R1 SUGGESTION the signature image is copied into every finalized attention (storage growth, duplicated sensitive image) -> reported to the user as a follow-up option (signature versions table referenced by id/hash). Environment note: in-process reviewers needed the `claude` CLI on PATH (VS Code extension binary).
