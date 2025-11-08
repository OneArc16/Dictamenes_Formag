'use client';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

export function Form({ methods, onSubmit, children }:{
  methods: UseFormReturn<any>,
  onSubmit: (data:any)=>void|Promise<void>,
  children: React.ReactNode
}) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {children}
      </form>
    </FormProvider>
  );
}
