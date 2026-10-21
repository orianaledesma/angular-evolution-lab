import data from './requirements.json';

export interface RequirementDemo {
  readonly path: string;
  readonly label: string;
}

export interface Requirement {
  readonly id: string;
  readonly demos: readonly RequirementDemo[];
  readonly tests: readonly string[];
}

/** Single source for the /requirements page and the README table (scripts/requirements-table.mjs). */
export const REQUIREMENTS: readonly Requirement[] = data;

export function testName(path: string): string {
  return path.split('/').pop() ?? path;
}
