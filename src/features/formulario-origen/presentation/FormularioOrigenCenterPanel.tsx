import { CheckCircle2, Circle, CircleDot } from 'lucide-react';

import type { FormularioOrigenDto, OriginTab } from './types';
import { DescripcionTab } from './tabs/DescripcionTab';
import { DiagnosticoTratamientoTab } from './tabs/DiagnosticoTratamientoTab';
import { HistorialLaboralTab } from './tabs/HistorialLaboralTab';
import { InformacionFundamentosTab } from './tabs/InformacionFundamentosTab';
import { SustentacionTab } from './tabs/SustentacionTab';

const TABS: Array<{ id: OriginTab; label: string }> = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'historial-laboral', label: 'Historial laboral' },
  { id: 'informacion-fundamentos', label: 'Información y Fundamentos' },
  { id: 'diagnostico-tratamiento', label: 'Diagnósticos' },
  { id: 'sustentacion', label: 'Sustentación' },
];

export function FormularioOrigenCenterPanel({
  formulario,
  activeTab,
  saving,
  onTabChange,
  onChange,
  onSave,
}: {
  formulario: FormularioOrigenDto;
  activeTab: OriginTab;
  saving: boolean;
  onTabChange: (tab: OriginTab) => void;
  onChange: (formulario: FormularioOrigenDto) => void;
  onSave: (tab: OriginTab) => Promise<boolean | void>;
}) {
  const sectionIssues = formulario.validation.issues.filter(
    (issue) => issue.section === activeTab,
  );
  const goNext = () => {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    const next = TABS[currentIndex + 1];
    if (next) onTabChange(next.id);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto border-b border-slate-200 bg-slate-50">
        <div
          role="tablist"
          aria-label="Secciones del Formulario de Origen"
          className="flex min-w-max px-2"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            const issueCount = formulario.validation.issues.filter(
              (issue) => issue.section === tab.id,
            ).length;
            const hasContent =
              tab.id === 'descripcion'
                ? Boolean(formulario.descripcion.trim())
                : tab.id === 'historial-laboral'
                  ? formulario.historialLaboral.length > 0
                  : tab.id === 'informacion-fundamentos'
                    ? formulario.soportes.length > 0
                    : tab.id === 'diagnostico-tratamiento'
                      ? formulario.diagnosticos.length > 0
                      : Boolean(
                          formulario.concepto ||
                            formulario.tipoEvento ||
                            formulario.origenEvento,
                        );
            const Icon = issueCount === 0 ? CheckCircle2 : hasContent ? CircleDot : Circle;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(event) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const currentIndex = TABS.findIndex((item) => item.id === tab.id);
                  const nextIndex =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? TABS.length - 1
                        : event.key === 'ArrowRight'
                          ? (currentIndex + 1) % TABS.length
                          : (currentIndex - 1 + TABS.length) % TABS.length;
                  const next = TABS[nextIndex];
                  onTabChange(next.id);
                  window.requestAnimationFrame(() => {
                    document.getElementById(`tab-${next.id}`)?.focus();
                  });
                }}
                className={`flex min-h-12 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 ${
                  active
                    ? 'border-sky-700 bg-white text-sky-900'
                    : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    issueCount === 0
                      ? 'text-emerald-700'
                      : hasContent
                        ? 'text-amber-700'
                        : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={-1}
        className="p-4 sm:p-6"
      >
        {activeTab === 'descripcion' ? (
          <DescripcionTab
            value={formulario.descripcion}
            actividadExtralaboral={formulario.actividadExtralaboral}
            readOnly={formulario.readOnly}
            saving={saving}
            issues={sectionIssues}
            onDescriptionChange={(descripcion) =>
              onChange({ ...formulario, descripcion })
            }
            onExtraActivityChange={(actividadExtralaboral) =>
              onChange({ ...formulario, actividadExtralaboral })
            }
            onSave={() => onSave('descripcion')}
            onContinue={goNext}
          />
        ) : null}
        {activeTab === 'historial-laboral' ? (
          <HistorialLaboralTab
            rows={formulario.historialLaboral}
            readOnly={formulario.readOnly}
            saving={saving}
            issues={sectionIssues}
            onChange={(historialLaboral) => onChange({ ...formulario, historialLaboral })}
            onSave={() => onSave('historial-laboral')}
            onContinue={goNext}
          />
        ) : null}
        {activeTab === 'informacion-fundamentos' ? (
          <InformacionFundamentosTab
            fechaOcurrencia={formulario.fechaOcurrencia}
            horaOcurrencia={formulario.horaOcurrencia}
            jornadaEvento={formulario.jornadaEvento}
            supports={formulario.soportes}
            readOnly={formulario.readOnly}
            saving={saving}
            issues={sectionIssues}
            onMetaChange={(patch) => onChange({ ...formulario, ...patch })}
            onSupportsChange={(soportes) => onChange({ ...formulario, soportes })}
            onSave={() => onSave('informacion-fundamentos')}
            onContinue={goNext}
          />
        ) : null}
        {activeTab === 'diagnostico-tratamiento' ? (
          <DiagnosticoTratamientoTab
            diagnosticos={formulario.diagnosticos}
            readOnly={formulario.readOnly}
            saving={saving}
            issues={sectionIssues}
            onDiagnosticosChange={(diagnosticos) =>
              onChange({ ...formulario, diagnosticos })
            }
            onSave={() => onSave('diagnostico-tratamiento')}
            onContinue={goNext}
          />
        ) : null}
        {activeTab === 'sustentacion' ? (
          <SustentacionTab
            concepto={formulario.concepto}
            fundamentosDerecho={formulario.fundamentosDerecho}
            tipoEvento={formulario.tipoEvento}
            origenEvento={formulario.origenEvento}
            readOnly={formulario.readOnly}
            saving={saving}
            issues={sectionIssues}
            hasAccidentData={Boolean(
              formulario.fechaOcurrencia ||
                formulario.horaOcurrencia ||
                formulario.jornadaEvento,
            )}
            onChange={(patch) => onChange({ ...formulario, ...patch })}
            onSave={() => onSave('sustentacion')}
          />
        ) : null}
      </div>
    </section>
  );
}
