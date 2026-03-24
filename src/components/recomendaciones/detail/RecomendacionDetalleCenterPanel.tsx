'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecomendacionTabFormulario } from '@/components/recomendaciones/detail/RecomendacionTabFormulario';
import { type RecomendacionDetalleViewModel } from '@/components/recomendaciones/detail/types';

export function RecomendacionDetalleCenterPanel({
  detalle,
  canEdit,
}: {
  detalle: RecomendacionDetalleViewModel;
  canEdit: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <Tabs defaultValue="formulario" className="w-full">
        <div className="border-b border-slate-200 bg-slate-50 px-4">
          <TabsList className="h-auto w-full justify-start rounded-none bg-transparent p-0">
            <TabsTrigger
              value="formulario"
              className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-xs font-medium text-slate-500 shadow-none data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-700 data-[state=active]:shadow-none"
            >
              Formulario de recomendaciones
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="formulario" className="mt-0 p-4 focus-visible:ring-0">
          <CardContent className="p-0">
            <RecomendacionTabFormulario detalle={detalle} canEdit={canEdit} />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
