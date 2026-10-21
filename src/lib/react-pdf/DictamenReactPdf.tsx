import React from 'react';
import { Document } from '@react-pdf/renderer';

import { PageFrame } from './components/PageFrame';
import { DICTAMEN_PAGE_TOP, HeaderBlock } from './blocks/Header';
import { AspectosGeneralesBlock } from './blocks/AspectosGenerales';
import { CondicionSaludBlock, HallazgosClinicosBlock } from './blocks/CondicionHallazgos';
import { IdentificacionEducadorBlock } from './blocks/IdentificacionEducador';
import { AntecedentesClinicosBlock } from './blocks/AntecedentesClinicos';
import { DiagnosticosMotivoBlock } from './blocks/DiagnosticosMotivo';
import { VariablesPerdidaCapacidadLaboralTituloIBlock } from './blocks/VariablesPerdidaCapacidadLaboralTituloI';
import { TituloIICapitulo1Block } from './blocks/TituloIICapitulo1Block';
import { TituloIICapitulo2Block } from './blocks/TituloIICapitulo2Block';
import { TituloIIIPage1Block } from './blocks/TituloIIIPage1Block';
import PorcentajePclBlock from '@/lib/react-pdf/blocks/PorcentajePclBlock';
import ProcedimientoBlock from './blocks/ProcedimientoBlock';
import {
  SustentacionTextoPart,
  SustentacionTablaOrigenPart,
} from './blocks/SustentacionOrigenBlock';
import FirmasJuntaBlock from '@/lib/react-pdf/blocks/FirmasJuntaBlock';
import { NotificacionPclPage } from './blocks/NotificacionPclPage';

type DictamenPdfData = {
  id?: number | string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
  logoSrc?: string | null;
  condicionSalud?: string | null;
  descripcionHallazgos?: string | null;
  antecedentesClinicos?: unknown;
  diagnosticos?: unknown;
  junta?: unknown;
  [key: string]: unknown;
};

type Props = {
  dictamen: DictamenPdfData;
  logoSrc?: string | null;
};

export function DictamenReactPdf({ dictamen, logoSrc }: Props) {
  const condicion = String(dictamen?.condicionSalud ?? '').trim();
  const hallazgos = String(dictamen?.descripcionHallazgos ?? '').trim();
  const finalLogoSrc = (logoSrc ?? dictamen?.logoSrc ?? null) as string | null;
  const showNotificacionPcl = Boolean(dictamen?.estaCerrado && dictamen?.notificacionPcl);

  return (
    <Document>
      {showNotificacionPcl ? (
        <NotificacionPclPage dictamen={dictamen} logoSrc={finalLogoSrc} />
      ) : null}
      <PageFrame
        paddingTop={DICTAMEN_PAGE_TOP}
        pageNumberBottom={34}
        pageNumberOffset={showNotificacionPcl ? 1 : 0}
        totalPagesOffset={showNotificacionPcl ? 1 : 0}
      >
        {/* Solo en la página 1 (como la plantilla); las demás páginas no repiten el encabezado */}
        <HeaderBlock
          logoSrc={finalLogoSrc}
          numeroDictamen={dictamen?.numeroDictamen ?? String(dictamen?.id ?? '')}
          fechaDictamen={dictamen?.fechaDictamen ?? null}
        />

        <AspectosGeneralesBlock dictamen={dictamen} />
        <IdentificacionEducadorBlock dictamen={dictamen} />
        <AntecedentesClinicosBlock dictamen={dictamen} />
        <DiagnosticosMotivoBlock dictamen={dictamen} />
        <CondicionSaludBlock condicion={condicion} />
        <HallazgosClinicosBlock hallazgos={hallazgos} />
        <VariablesPerdidaCapacidadLaboralTituloIBlock dictamen={dictamen} />
        <TituloIICapitulo1Block dictamen={dictamen} />
        <TituloIICapitulo2Block dictamen={dictamen} />
        <TituloIIIPage1Block dictamen={dictamen} />
        <PorcentajePclBlock dictamen={dictamen} />
        <ProcedimientoBlock dictamen={dictamen} />
        <SustentacionTextoPart dictamen={dictamen} />
        <SustentacionTablaOrigenPart dictamen={dictamen} />
        <FirmasJuntaBlock dictamen={dictamen} />
      </PageFrame>
    </Document>
  );
}
