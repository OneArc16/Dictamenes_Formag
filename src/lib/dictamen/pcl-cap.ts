/** A loss of work capacity (PCL) can never exceed 100%. */
export const PCL_MAX = 100;

export function capPcl(value: number): number;
export function capPcl(value: number | null): number | null;
export function capPcl(value: number | null): number | null {
  return value == null ? null : Math.min(value, PCL_MAX);
}
