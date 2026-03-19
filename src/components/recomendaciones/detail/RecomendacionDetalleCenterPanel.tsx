'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RecomendacionTabExamenesConcepto } from '@/components/recomendaciones/detail/RecomendacionTabExamenesConcepto';
import { type RecomendacionDetalleViewModel } from '@/components/recomendaciones/detail/types';

function ReadOnlyTextarea({
  label,
  value,
  placeholder,
  minHeightClassName,
}: {
  label: string;
  value: string;
  placeholder: string;
  minHeightClassName: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </Label>
      <Textarea
        readOnly
        value={value}
        placeholder={placeholder}
        className={minHeightClassName + ' resize-y rounded-2xl border-slate-200 bg-white text-slate-700 shadow-none'}
      />
    </div>
  );
}

export function RecomendacionDetalleCenterPanel({
  detalle,
}: {
  detalle: RecomendacionDetalleViewModel;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <Tabs defaultValue="examenes-concepto" className="w-full">
        <div className="border-b border-slate-200 bg-slate-50 px-4">
          <TabsList className="h-auto w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="examenes-concepto"
              className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-xs font-medium text-slate-500 shadow-none data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              Examenes realizados y concepto
            </TabsTrigger>
            <TabsTrigger
              value="recomendaciones"
              className="ml-6 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-xs font-medium text-slate-500 shadow-none data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              Recomendaciones y observaciones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="examenes-concepto" className="mt-0 p-4 focus-visible:ring-0">
          <CardContent className="p-0">
            <RecomendacionTabExamenesConcepto detalle={detalle} />
          </CardContent>
        </TabsContent>

        <TabsContent value="recomendaciones" className="mt-0 p-4 focus-visible:ring-0">
          <CardContent className="space-y-6 p-0">
            <ReadOnlyTextarea
              label="Recomendaciones y observaciones"
              value={detalle.recomendacionesObservaciones}
              placeholder="Sin recomendaciones registradas"
              minHeightClassName="min-h-[240px]"
            />

            <ReadOnlyTextarea
              label="Restricciones laborales"
              value={detalle.restriccionesLaborales}
              placeholder="Sin restricciones registradas"
              minHeightClassName="min-h-[200px]"
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
