export function getReopeningTargets(input: {
  flujoVersion: 'LEGACY' | 'ORIGEN_PREVIO';
  originState: 'BORRADOR' | 'FINALIZADO' | 'REABIERTO' | null;
  pclClosed: boolean;
  canReopenOrigin: boolean;
  canReopenPcl: boolean;
}) {
  const targets: Array<'ORIGEN' | 'PCL'> = [];

  if (
    input.flujoVersion === 'ORIGEN_PREVIO' &&
    input.originState === 'FINALIZADO' &&
    input.canReopenOrigin
  ) {
    targets.push('ORIGEN');
  }

  if (
    input.pclClosed &&
    input.canReopenPcl &&
    (input.flujoVersion === 'LEGACY' || input.originState === 'FINALIZADO')
  ) {
    targets.push('PCL');
  }

  return targets;
}
