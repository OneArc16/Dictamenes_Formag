# Clinical print formats (HC, remisión, incapacidad, …)
Branch: origen · Delivery: work-unit commits on the current branch; no push or PR (ask-on-risk)
Test runner: node --import tsx --test (package.json `test:atenciones`), pnpm exec eslint, tsc (6 pre-existing missing-module errors outside scope)

## Specs

### S1 — Historia clínica print format
User request: "ahora hagamos los formatos de las hc, remision, incapacidad etc, empezando por la HC te dare unas imagenes y no quiero que la calques simplemente has un diseño similar, que demuestre que somos originales. recuerda el formato cumpla las normas, la firma es del medico que lo atendio"

Scope: replace the plain-text HC PDF served by `/api/reception/appointments/[id]/clinical-documents/hc` with a designed react-pdf document. Similar content to the reference images (institution header, patient identification, anamnesis, antecedentes, signos vitales/examen físico, revisión por sistemas, diagnósticos CIE-10, análisis/plan/tratamiento, evoluciones, signature) but an original layout, not a copy.

Acceptance criteria:
- Institution identification: name, NIT, habilitation code, sede address/phone, logo.
- Patient identification per Res. 1995/1999 and Res. 866/2021 minimum data available in the system: name, document, age, birth date, sex, civil status, address, phone, EPS, occupation (cargo docente), ethnic group, attention date and time, sede, specialty.
- Clinical sections with only recorded content; diagnoses with CIE-10 code and principal/related order.
- Signature block of the physician who attended (`Cita.medico`): signature image when stored, full name, document, medical registration, specialty.
- Every page: institution header with attention number and date, "Página X de Y", confidentiality notice (Ley 23/1981, Res. 1995/1999, Ley 1581/2012). No repeated patient strip (L6).
- Existing access guards (attended appointment, site scope) unchanged.

### S2 — Remisión print format
User request: "Hazlo con el mismo estilo para que manejemos uno solo" (with a reference image of the current remisión).

Scope: replace the plain-text remisión PDF (`clinical-documents/remision`, optional `remisionId`) with a react-pdf document built from the same shared pieces as the HC (header, patient grid, sections, signature, footer), so both formats are maintained in one place.

Acceptance criteria:
- Same header/footer/patient identification as the HC; badge "REMISIÓN" with remisión number, atención number and date.
- Diagnoses of the remisión with CIE-10 code, principal first then related.
- Requested service: CUPS code and name; motivo. The junta médica calificación type is not printed (L12).
- Signature of the physician who attended the appointment.
- Each remisión on its own page; `remisionId` prints only that one; unavailable remisión keeps the existing 404 error.
### S3 — Incapacidad print format (pending)

## Tasks

- T1 (S1): HC view model (pure, tested) + react-pdf document + wire `hc` kind in clinical-document-service. Route: inline (no writer reason). Status: complete. Commit: see Log L5.
- T2 (S2): Shared PDF kit extracted from the HC + remisión model/PDF + wire `remision` kind. Route: inline (single unit, no writer reason). Status: complete (see L11).
- T3 (S3): Incapacidad format on the shared kit. Route: TBD. Status: next (S2 accepted, L13).

## Log

L1: "ahora hagamos los formatos de las hc, remision, incapacidad etc, empezando por la HC te dare unas imagenes y no quiero que la calques simplemente has un diseño similar, que demuestre que somos originales. recuerda el formato cumpla las normas, la firma es del medico que lo atendio"
L2: Evidence: HC is rendered as plain text with pdf-lib (`clinical-document-service.ts`). react-pdf kit exists in `src/lib/react-pdf` (Helvetica only, logo `public/assets/logo-sism.png`). Doctor signature in `Empleado.firma/firmaMime`, `registroMedico`, specialties via `EmpleadoEspecialidad`. No NIT column in `CentroMedico`/`Sede`; NIT 900 018 045-5 is hard-coded in `RecomendacionLaboralReactPdf.tsx`. Attention finalization time = `CitaHistorial` event `ATENDIDA`.
L3: Assumption: institution NIT reuses the hard-coded value; habilitation code from `Sede.codigoHabilitacion` falling back to `CentroMedico.codigoHabilitacion`.
L4: Implementation: `presentation/print/historia-clinica-model.ts` (pure view model), `presentation/print/HistoriaClinicaPdf.tsx` (react-pdf, Letter, fixed header + patient strip + legal footer with page X of Y, numbered sections, signature of `Cita.medico`), `application/historia-clinica-print.ts` (loads sede/centro, doctor signature and registration, patient extra fields, ATENDIDA event time). Old plain-text HC path removed from `clinical-document-service.ts`; remisión/incapacidad still use pdf-lib (S2/S3). Sex mapping follows `esMujer` (H masculino; M/F femenino) — the registration form offers M=Masculino, a pre-existing inconsistency reported to the user. react-pdf quirks: `lineHeight` on Page hides absolute fixed footers; `lineHeight` resolves with the fontSize of the same style, so it lives with `fontSize` in `s.body`.
L5: Verification: test:atenciones 64/64 (6 model tests + 1 render smoke test), test:reception 16/16, eslint clean, tsc only the 6 pre-existing missing-module errors. Rendered cita 1 from the local DB: 4 Letter pages with header, patient strip, footer and doctor signature on every expected place.
L6 (2026-11-02): "Quitemos esa parte en todas las hojas" (screenshot of the patient name/document strip under the header). Strip removed; header keeps attention number and date on every page. Sample HC now 3 pages; model + render tests 6/6, eslint clean.
L7 (2026-11-02): "Puedes hacer las letras un poco mas pequeñas para ahorrar hojas y tinta/toner". Body text 8.5→7.5 pt (lineHeight 1.3), labels/headers/footer reduced ~1 pt, tighter paddings and margins. Sample HC: 3 pages, third page now only closes orders, evolutions and signature. Tests 6/6, eslint clean.
L8 (2026-11-02): "Esta parte no me gusta, porque lo de la direccion esta muy grande" (screenshot of the identification grid). Cause: the EPS name wrapped to 3 lines in a 25% cell, stretching the Dirección row. Grid regrouped: short fields + phone in one row, Dirección 40% / EPS 60% (EPS now one line). Side finding: react-pdf moved a whole section to the next page when it missed only its marginBottom; section spacing moved to marginTop. Sample HC: 3 pages, page 1 full. Tests 6/6, eslint clean.
L9 (2026-11-02): "Me gusta" — user accepted the HC format (S1 closed).
L10 (2026-11-02): "Hazlo con el mismo estilo para que manejemos uno solo" — remisión reference image shows admission data, diagnoses PPL/R1-R3, detail table (especialidad, diagnóstico, procedimiento, exámenes) and doctor signature.
L11 (2026-11-02): T2 done. Shared pieces: `presentation/print/documento-clinico-model.ts` (header/patient/professional model, date helpers) and `clinical-pdf-kit.tsx` (ClinicalPage header+footer, PacienteSection, Section, Field, Rows, Paragraph, DiagnosticosTable, Firma). HC rebuilt on the kit (differential check vs base: same pages, only the badge date drawn as one text run instead of two). Remisión: `remision-model.ts` (+3 tests) and `RemisionPdf.tsx`, one page per remisión, badge with remisión/atención number and date, CIE-10 table, CUPS service, junta type, motivo, attending doctor signature. Loader renamed to `application/documentos-clinicos-print.ts`; reception service keeps the 404 for an unavailable remisión. Checks: test:atenciones 67/67, test:reception 16/16, eslint clean, tsc no new errors; sample render of cita 1: 2 remisiones on 2 pages.
L12 (2026-11-02): "El tipo de calificacion no debe verse en la pdf". Removed the junta type field from the remisión PDF and model; test now asserts it is not printed.
L13 (2026-11-02): "me gusta" — user accepted the remisión format (S2 closed). Next: S3 incapacidad.
