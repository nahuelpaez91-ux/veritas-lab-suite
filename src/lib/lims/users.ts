import type { Role } from './model';

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  password: string;
}

// Contraseñas visibles a propósito: es una demo pública y la barra de demo las muestra.
// En producción: proveedor de identidad (SSO) y contraseñas con hash; ver supabase/migrations/0002_rls.sql.
export const DEMO_USERS: DemoUser[] = [
  { id: 'u-analista', name: 'M. Gómez', role: 'analyst', password: 'analista123' },
  { id: 'u-validador', name: 'L. Herrera', role: 'validator', password: 'validador123' },
  { id: 'u-admin', name: 'A. N. Páez', role: 'admin', password: 'admin123' },
];

export function findUser(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id);
}
