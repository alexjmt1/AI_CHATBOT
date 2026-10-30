// 10 OpenAI models, cheapest to most capable.
// Prices are USD per 1M tokens (input / output) taken from public list prices
// at the time of writing. Set a price to null if unknown; cost then shows "n/a".
// Edit freely: the server only accepts ids from this list.
export const MODELS = [
  { id: "gpt-6-luna",    label: "GPT-6 Luna",    tier: "Low cost",   input: 0.1,  output: 0.5,  note: "Bulk, simple tasks" },
  { id: "gpt-5.6-luna",  label: "GPT-5.6 Luna",  tier: "Low cost",   input: 0.2,  output: 1.2,  note: "Previous-gen low tier" },
  { id: "gpt-5.6-terra", label: "GPT-5.6 Terra", tier: "Balanced",   input: 2,    output: 12,   note: "Previous-gen middle tier" },
  { id: "gpt-6-sol",     label: "GPT-6 Sol",     tier: "Workhorse",  input: 2,    output: 10,   note: "Best everyday default" },
  { id: "gpt-6.1-terra", label: "GPT-6.1 Terra", tier: "Balanced",   input: null, output: null, note: "Newest, price unconfirmed" },
  { id: "gpt-6.1-sol",   label: "GPT-6.1 Sol",   tier: "Workhorse+", input: null, output: null, note: "Near-Astra, price unconfirmed" },
  { id: "gpt-5.6-sol",   label: "GPT-5.6 Sol",   tier: "Strong",     input: 4,    output: 20,   note: "Previous-gen flagship" },
  { id: "gpt-5.5",       label: "GPT-5.5",       tier: "Strong",     input: 5,    output: 30,   note: "April 2026 flagship" },
  { id: "gpt-6-astra",   label: "GPT-6 Astra",   tier: "Frontier",   input: 10,   output: 50,   note: "Most capable, costly" },
];

// Tenth slot: lightest older model. Swap for any model id on your account.
MODELS.unshift({ id: "gpt-5.4-nano", label: "GPT-5.4 Nano", tier: "Lowest", input: null, output: null, note: "Smallest, price unconfirmed" });

export const ALLOWED = new Set(MODELS.map((m) => m.id));

export function costOf(model, usage) {
  const m = MODELS.find((x) => x.id === model);
  if (!m || m.input == null || m.output == null || !usage) return null;
  return (usage.prompt_tokens * m.input + usage.completion_tokens * m.output) / 1e6;
}
