import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { styles } from './styles/theme';

import { Header } from './sections/Header';
import { Identificacion } from './sections/Identificacion';
// import { TituloI } from '../sections/TituloI';
// import { TituloII } from '../sections/TituloII';
// import { TituloIII } from '../sections/TituloIII';
// import { Firmas } from '../sections/Firmas';

export type DictamenPdfData = {
  id: number;
  procedimientoPcl: 'A' | 'B';
  // agrega aquí lo que necesitas desde tu BD
  docenteNombre: string;
  docenteIdentificacion: string;
  fechaDictamen: string;
};

export function DictamenPdf({ data }: { data: DictamenPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <View style={{ marginTop: 8, gap: 6 }}>
          <Identificacion data={data} />
          <TituloI data={data} />
          <TituloII data={data} />
          {/* Titulo III solo si aplica */}
          {data.procedimientoPcl === 'A' ? <TituloIII data={data} /> : null}
          <Firmas data={data} />
        </View>
      </Page>
    </Document>
  );
}