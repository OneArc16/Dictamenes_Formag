//DictamenReactPdf

import React from 'react';
import { Document } from '@react-pdf/renderer';

import { PageFrame } from './components/PageFrame';
import { SectionBox } from './components/SectionBox';
import { HeaderBlock } from './blocks/Header';
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
import SustentacionOrigenBlock, {
  SustentacionTextoPart,
  SustentacionTablaOrigenPart,
} from './blocks/SustentacionOrigenBlock';
import FirmasJuntaBlock from '@/lib/react-pdf/blocks/FirmasJuntaBlock';

type Props = {
  dictamen: any;
  logoSrc?: string | null;
};

export function DictamenReactPdf({ dictamen, logoSrc }: Props) {
  const condicion = String(dictamen?.condicionSalud ?? '').trim();
  const hallazgos = String(dictamen?.descripcionHallazgos ?? '').trim();
  const finalLogoSrc = (logoSrc ?? dictamen?.logoSrc ?? null) as string | null;

  return (
    <Document>
      <PageFrame>
        <HeaderBlock
          logoSrc={finalLogoSrc}
          numeroDictamen={dictamen?.numeroDictamen ?? String(dictamen?.id ?? '')}
          fechaDictamen={dictamen?.fechaDictamen ?? null}
        />

        <SectionBox joinTop wrap={false} minPresenceAhead={80}>
          <AspectosGeneralesBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox joinTop wrap={false} minPresenceAhead={110}>
          <IdentificacionEducadorBlock dictamen={dictamen} />
        </SectionBox>

        {/* ✅ Largo: permitir partir */}
        <SectionBox minPresenceAhead={40}>
          <AntecedentesClinicosBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={40}>
          <DiagnosticosMotivoBlock dictamen={dictamen} />
        </SectionBox>

        {/* ✅ Largo: permitir partir */}
        <SectionBox minPresenceAhead={10}>
          <CondicionSaludBlock condicion={condicion} />
          <HallazgosClinicosBlock hallazgos={hallazgos} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <VariablesPerdidaCapacidadLaboralTituloIBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <TituloIICapitulo1Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <TituloIICapitulo2Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <TituloIIIPage1Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <PorcentajePclBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox minPresenceAhead={60}>
          <ProcedimientoBlock dictamen={dictamen} />
        </SectionBox>

        {/* ✅ Sustentación (texto) PARTIBLE: llena el espacio en blanco */}
        <SectionBox minPresenceAhead={20} joinBottom>
          <SustentacionTextoPart dictamen={dictamen} />
        </SectionBox>

        {/* ✅ Tabla NO PARTIBLE: si no cabe, se va completa a la siguiente página */}
        <SectionBox joinTop wrap={false} minPresenceAhead={120}>
          <SustentacionTablaOrigenPart dictamen={dictamen} />
        </SectionBox>

        {/* ✅ Firmas: NO partir, y reservar buen espacio */}
        <SectionBox joinTop wrap={false} minPresenceAhead={220}>
          <FirmasJuntaBlock dictamen={dictamen} />
        </SectionBox>
      </PageFrame>
    </Document>
  );
}