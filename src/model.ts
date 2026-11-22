// Matches Yağız's src/context/score.ts. These are CONTENT levels, not measured load.
export type Level = 'short' | 'medium' | 'detailed';
export type StopId = 'tosun' | 'ic' | 'lake';
export type Selection = StopId | 'outside';
export const LEVELS: Level[] = ['short', 'medium', 'detailed'];
export const levelLabels: Record<Level, string> = {
  short: 'Short', medium: 'Medium', detailed: 'Detailed',
};

export interface Source { title: string; url: string }
export interface Chapter {
  id: string;
  title: string;
  kicker: string;
  image: 'founder' | 'nature' | 'garden' | null;
  texts: Record<Level, string>;
  sources: Source[];
}
export interface Stop {
  id: StopId;
  name: string;
  subtitle: string;
  active: boolean;
  title: string;
  texts: Record<Level, string>;
  sources: Source[];
  chapters?: Chapter[];
}
export interface DemoState { location: Selection; level: Level }
export type DemoAction = { type: 'location'; value: Selection } | { type: 'level'; value: Level } | { type: 'reset' };
export const INITIAL_STATE: DemoState = { location: 'outside', level: 'medium' };

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'reset') return { ...INITIAL_STATE };
  if (action.type === 'location') return { ...state, location: action.value };
  return { ...state, level: action.value };
}

export function getActiveStory(stops: Stop[], state: DemoState) {
  const stop = stops.find((item) => item.id === state.location && item.active);
  return stop ? { stop, text: stop.texts[state.level] } : null;
}

// Future integration boundary. No sensor connection or auto-selection in this demo.
// The context module emits a level; this adapter validates it before the UI uses it.
export function parseContextLevel(value: unknown): Level | null {
  return value === 'short' || value === 'medium' || value === 'detailed' ? value : null;
}
