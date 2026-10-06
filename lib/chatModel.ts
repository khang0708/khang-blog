// Cheap-by-default model routing for the chat endpoint: Haiku for short factual questions,
// Sonnet when the question looks like it needs comparison, reasoning or a long answer.
// ponytail: keyword heuristic, no extra LLM call. Swap for a classifier if routing quality matters.
export const FAST = "claude-haiku-4-5";
export const SMART = "claude-sonnet-5-5";

const hard =
  /\b(compare|comparison|difference|differ|why|how (does|did|do|would)|explain|architecture|design|trade-?offs?|scal(e|ing|able)|in detail|step by step|pros|cons)\b|so sánh|khác nhau|khác biệt|tại sao|vì sao|giải thích|kiến trúc|thiết kế|chi tiết|từng bước|đánh đổi|ưu nhược|như thế nào/i;

export function pickModel(question: string, turns: number, override?: string): string {
  if (override) return override;
  const q = question.trim();
  const questions = (q.match(/[?？]/g) ?? []).length;
  return q.length > 160 || questions > 1 || turns > 6 || hard.test(q) ? SMART : FAST;
}
