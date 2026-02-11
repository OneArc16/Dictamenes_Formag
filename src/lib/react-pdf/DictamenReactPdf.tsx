import React from 'react';
import { Document, View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from './theme';

import { PageFrame } from './components/PageFrame';
import { SectionBox } from './components/SectionBox';
import { HeaderBlock } from './blocks/Header';
import { AspectosGeneralesBlock } from './blocks/AspectosGenerales';
import { CondicionHallazgosBlock } from './blocks/CondicionHallazgos';
import { IdentificacionEducadorBlock } from './blocks/IdentificacionEducador';
import { AntecedentesClinicosBlock } from './blocks/AntecedentesClinicos';
import { DiagnosticosMotivoBlock } from './blocks/DiagnosticosMotivo';
import { VariablesPerdidaCapacidadLaboralTituloIBlock } from './blocks/VariablesPerdidaCapacidadLaboralTituloI';
import { TituloIICapitulo1Block } from './blocks/TituloIICapitulo1Block';
import { TituloIICapitulo2Block } from './blocks/TituloIICapitulo2Block';
import { TituloIIIPage1Block } from './blocks/TituloIIIPage1Block';
import PorcentajePclBlock from '@/lib/react-pdf/blocks/PorcentajePclBlock';
import ProcedimientoBlock from './blocks/ProcedimientoBlock';
import SustentacionOrigenBlock from './blocks/SustentacionOrigenBlock';


type Props = {
  dictamen: any;
  logoSrc?: string | null;
};

const PAGE_PAD_X = (pdfTheme as any)?.sizes?.pagePaddingX ?? 18;
const PAGE_PAD_Y = (pdfTheme as any)?.sizes?.pagePaddingY ?? 18;
const PAGE_END_GAP = 12;

const styles = StyleSheet.create({
  pageEndLine: {
    position: 'absolute',
    left: PAGE_PAD_X,
    right: PAGE_PAD_X,
    bottom: Math.max(6, PAGE_PAD_Y - PAGE_END_GAP),
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
  },
});

export function DictamenReactPdf({ dictamen, logoSrc }: Props) {
  const condicion = String(dictamen?.condicionSalud ?? '').trim();
  const hallazgos = String(dictamen?.descripcionHallazgos ?? '').trim();

  const finalLogoSrc = (logoSrc ?? dictamen?.logoSrc ?? null) as string | null;

  return (
    <Document>
      <PageFrame>
        <View fixed style={styles.pageEndLine} />

        <HeaderBlock
          logoSrc={finalLogoSrc}
          numeroDictamen={dictamen?.numeroDictamen ?? String(dictamen?.id ?? '')}
          fechaDictamen={dictamen?.fechaDictamen ?? null}
        />

        <SectionBox joinTop>
          <AspectosGeneralesBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox joinTop>
          <IdentificacionEducadorBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox>
          <AntecedentesClinicosBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2 }}>
          <DiagnosticosMotivoBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: 0 }}>
          <CondicionHallazgosBlock condicion={condicion} hallazgos={hallazgos} />
        </SectionBox>

        <SectionBox style={{ marginTop: 0 }}>
          <VariablesPerdidaCapacidadLaboralTituloIBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2 }}>
          <TituloIICapitulo1Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2 }}>
          <TituloIICapitulo2Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2}}>
          <TituloIIIPage1Block dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: 0}}>
          <PorcentajePclBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2}}>
          <ProcedimientoBlock dictamen={dictamen} />
        </SectionBox>

        <SectionBox style={{ marginTop: -2}}>
          <SustentacionOrigenBlock dictamen={dictamen} />
        </SectionBox>

      </PageFrame>
    </Document>
  );
}