import type { Prompt } from "../schemas/prompt";

export function RetrievalPrompt({ prompt }: { prompt: Prompt }) {
  return (
    <section className="retrieval">
      <p className="kind">{prompt.kind}</p>
      <p>{prompt.retrievable}</p>
      <details>
        <summary>Sourced answer</summary>
        <p>{prompt.answerKey}</p>
      </details>
    </section>
  );
}
