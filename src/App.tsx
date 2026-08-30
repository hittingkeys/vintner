import Lesson, { frontmatter } from "../content/occupied-root-zone.mdx";
import { RetrievalPrompt } from "./content/RetrievalPrompt";
import { OccupiedPawExplorable } from "./explorables/occupied-paw/OccupiedPawExplorable";
import type { LessonFrontmatter } from "./schemas/content";

const lesson = frontmatter as unknown as LessonFrontmatter;
const prompt = lesson.prompts?.[0];

function LessonRetrievalPrompt() {
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

export default function App() {
  return (
    <main>
      <h1>Vintner explorables</h1>
      <Lesson
        components={{
          OccupiedPaw: OccupiedPawExplorable,
          RetrievalPrompt: LessonRetrievalPrompt,
        }}
      />
    </main>
  );
}
