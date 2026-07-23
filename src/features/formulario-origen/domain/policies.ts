export type OriginPolicyInput = {
  flujoVersion: 'LEGACY' | 'ORIGEN_PREVIO';
  formularioOrigenEstado?: 'BORRADOR' | 'FINALIZADO' | 'REABIERTO' | null;
  pclCerrado?: boolean;
  pclReabierto?: boolean;
  pclIniciado?: boolean;
  pclRequiereRevision?: boolean;
};

export function canAccessPcl(input: OriginPolicyInput): boolean {
  return (
    input.flujoVersion === 'LEGACY' ||
    input.formularioOrigenEstado === 'FINALIZADO'
  );
}
export function canEditPcl(
  input: OriginPolicyInput,
  context: { hasEditPermission: boolean; isAssigned: boolean },
): boolean {
  return (
    canAccessPcl(input) &&
    context.hasEditPermission &&
    context.isAssigned &&
    !input.pclCerrado
  );
}

export function getVisibleCaseState(input: OriginPolicyInput) {
  if (input.flujoVersion === 'LEGACY') {
    return {
      etapa: 'FLUJO_ANTERIOR' as const,
      estado: input.pclCerrado
        ? ('CERRADO' as const)
        : input.pclReabierto
          ? ('REABIERTO' as const)
          : ('PENDIENTE' as const),
    };
  }

  if (input.formularioOrigenEstado === 'BORRADOR') {
    return { etapa: 'FORMULARIO_ORIGEN' as const, estado: 'BORRADOR' as const };
  }
  if (input.formularioOrigenEstado === 'REABIERTO') {
    return { etapa: 'FORMULARIO_ORIGEN' as const, estado: 'REABIERTO' as const };
  }
  if (!input.pclIniciado) {
    return { etapa: 'DICTAMEN_PCL' as const, estado: 'HABILITADO' as const };
  }

  return {
    etapa: 'DICTAMEN_PCL' as const,
    estado: input.pclCerrado
      ? ('CERRADO' as const)
      : input.pclReabierto
        ? ('REABIERTO' as const)
        : ('PENDIENTE' as const),
  };
}
