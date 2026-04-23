/**
 * uCode for MDX — interactive documentation only (no vault / FS / network).
 * @see dev/decisions when added; spec: uDos A1 MDX uCode locked brief.
 */

export type Stmt =
  | { kind: "print"; expr: string }
  | { kind: "input"; prompt: string; varName: string }
  | { kind: "choice"; prompt: string; options: string[] }
  | { kind: "next"; target: string }
  | { kind: "back"; target: string }
  | { kind: "goto"; target: string }
  | { kind: "show"; id: string; condition?: string }
  | { kind: "hide"; id: string; defaultHidden?: boolean }
  | { kind: "let"; name: string; expr: string }
  | {
      kind: "quiz";
      question: string;
      options: { label: string; correct: boolean }[];
      /** When present, shown after the learner picks (e.g. correct/incorrect copy). */
      feedback?: string;
    }
  | { kind: "feedback"; text: string }
  | { kind: "if"; cond: string; then: Stmt[]; else: Stmt[] };

export interface MdxUcodeHost {
  print: (text: string) => void | Promise<void>;
  /** Single-line prompt → user string */
  input: (prompt: string) => Promise<string>;
  /** Returns chosen option label exactly as listed (e.g. YES / NO) */
  choice: (prompt: string, options: string[]) => Promise<string>;
  navigate: (kind: "next" | "back" | "goto", target: string) => void | Promise<void>;
  setVisibility: (id: string, visible: boolean) => void | Promise<void>;
  quizFeedback: (text: string) => void | Promise<void>;
}

export interface MdxUcodeSessionStore {
  load(): Record<string, string>;
  save(vars: Record<string, string>): void;
}

export interface RunOptions {
  /** When set, string vars are restored / persisted (browser localStorage only). */
  session?: MdxUcodeSessionStore;
}
