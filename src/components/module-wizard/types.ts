export type StepKind = "interactive" | "learning" | "review";

export interface StepDefinition {
  step:     number;
  title:    string;
  subtitle: string;
  kind:     StepKind;
}

export interface ModuleWizardDataBase {
  current_step: number;
  step_notes:   Record<string, string>;
  status?:      string;
}

export type SaveResult =
  | { ok: true;  savedAt: string }
  | { ok: false; error:   string };
