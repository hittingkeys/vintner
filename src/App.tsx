import { useEffect, useState } from "react";
import OccupiedLesson, {
  frontmatter as occupiedFrontmatter,
} from "../content/occupied-root-zone.mdx";
import SoilsLesson, {
  frontmatter as soilsFrontmatter,
} from "../content/willamette-soils.mdx";
import { RetrievalPrompt } from "./content/RetrievalPrompt";
import { OccupiedPawExplorable } from "./explorables/occupied-paw/OccupiedPawExplorable";
import { WillametteSoilsExplorable } from "./explorables/willamette-soils/WillametteSoilsExplorable";
import { lessonFromHash, type LessonId } from "./lesson-route";
import type { LessonFrontmatter } from "./schemas/content";

const soilsLesson = soilsFrontmatter as unknown as LessonFrontmatter;
const occupiedLesson = occupiedFrontmatter as unknown as LessonFrontmatter;

function SoilsRetrievalPrompt({ index = 0 }: { index?: number }) {
  const prompt = soilsLesson.prompts?.[index];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

function OccupiedRetrievalPrompt() {
  const prompt = occupiedLesson.prompts?.[0];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

export default function App() {
  const [lessonId, setLessonId] = useState<LessonId>(() =>
    lessonFromHash(window.location.hash),
  );

  useEffect(() => {
    function onHash() {
      setLessonId(lessonFromHash(window.location.hash));
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const occupied = lessonId === "occupied-root-zone";

  return (
    <main>
      <h1>Vintner explorables</h1>
      <nav className="lesson-nav">
        {occupied ? (
          <a href="#/">Willamette soils</a>
        ) : (
          <a href="#/occupied-root-zone">Occupied root zone</a>
        )}
      </nav>
      {occupied ? (
        <OccupiedLesson
          components={{
            OccupiedPaw: OccupiedPawExplorable,
            RetrievalPrompt: OccupiedRetrievalPrompt,
          }}
        />
      ) : (
        <SoilsLesson
          components={{
            WillametteSoils: WillametteSoilsExplorable,
            RetrievalPrompt: SoilsRetrievalPrompt,
          }}
        />
      )}
    </main>
  );
}
