# Atencion documents for attended appointments
Branch: origen
Delivery: work-unit commits on the current feature branch; no push or PR
Test runner: pnpm exec tsx --test, pnpm exec eslint

## Specs

### S1 — Print documents from attended appointment history
User request: "Para los estados de Atendido, debemos colocar los botones para imprimir los documentos, el de la incapacidad, remision, HC, etc, los botones deben ser minimalistas y la hoja debe abrirse en otra pestaña"

Scope: On attended appointment cards in the reception history, provide minimal icon actions for the available clinical documents. The first implementation covers clinical history (HC), incapacity documents, and referral documents; the HC includes the clinical information already stored for the attended appointment. Each document opens in a new browser tab as an inline printable sheet.

Acceptance criteria:
- Actions appear only for `ATENDIDA` appointments.
- HC is available for every attended appointment; incapacity and referral actions are shown only when that appointment has the corresponding documents.
- Actions use the existing minimal icon-button pattern with accessible labels and tooltips.
- Opening an action preserves the reception page and opens the printable document in a new tab.
- Document endpoints enforce authenticated reception access, attended-appointment scope, and inline PDF responses.
- A single remisión action opens a selector when there are two or more remisiones; selecting one prints only that remisión, while a single remisión opens directly.

## Tasks

- T1 (S1): Add server-side clinical document data and printable endpoints. Route: delegated backend writer. Status: complete after endpoint-contract correction. Commit: e654ebb.
- T2 (S1): Add attended-history document actions and new-tab behavior. Route: delegated frontend writer, parent seam correction. Status: complete. Commit: e654ebb.
- T3 (S1): Run focused tests, lint, type checks, and seam verification. Route: inline parent verification plus independent verifier. Status: complete; no focused route/browser test exists. Commit: e654ebb.

## Log

L1: "Para los estados de Atendido, debemos colocar los botones para imprimir los documentos, el de la incapacidad, remision, HC, etc, los botones deben ser minimalistas y la hoja debe abrirse en otra pestaña"
L2: Existing evidence: `PatientReceptionPage` already has an icon-action pattern and a new-tab PDF flow for appointment reminders. The appointment history API currently returns no clinical-document counts. Existing clinical data is available through `getAtencionDetalle`, and no print routes exist for incapacity, referral, or HC.
L3: Assumption: the initial "etc" scope is represented by HC, incapacity, and referral documents; evolutions, diagnoses, and vital signs are included in HC rather than separate buttons.
L4: Implementation: the history API now returns attended-only clinical-document availability counts; HC, incapacity, and referral PDFs are served from `/api/reception/appointments/[id]/clinical-documents/[document]`. The UI uses the same route and document kinds (`hc`, `incapacidad`, `remision`) and opens each PDF in a detached new tab.
L5: Verification: focused ESLint passed; `git diff --check` passed; 15 focused domain/application tests passed. TypeScript remains blocked by six pre-existing missing `sharp` and `@react-pdf/types` modules outside the changed reception files. Independent static verification found no blockers and confirmed authentication, ATENDIDA status, site scope, document availability, and PDF security headers. Risk: item 2 (clinical-document access and site/status guards).
L6: User correction: "hagamos algo para que ls remisiones salgan en dos hojas diferentes, no en la misma hoja, sin tener que poner dos botones diferentes". The single remisión action now inserts a page break before every remisión after the first.
L7: User correction: "no me referia asi, si hay dos o mas remisiones este abra un modal para seleccionar cual imprimir". The UI now opens a modal for two or more remisiones and sends the selected remisionId to the PDF endpoint; one remisión still opens directly.
L8: User report: the remisión selector overflowed horizontally for long CUPS labels. The option buttons now occupy the modal width and allow their descriptive text to wrap.
L9: User report: choosing a remisión closed the selector modal. The option action now opens the selected PDF in a new tab while keeping the modal available until the user explicitly closes it.
