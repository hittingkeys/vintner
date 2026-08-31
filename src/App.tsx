import { useEffect, useState } from "react";
import OccupiedLesson, {
  frontmatter as occupiedFrontmatter,
} from "../content/occupied-root-zone.mdx";
import SameHillLesson, {
  frontmatter as sameHillFrontmatter,
} from "../content/same-hill.mdx";
import SoilsLesson, {
  frontmatter as soilsFrontmatter,
} from "../content/willamette-soils.mdx";
import { RetrievalPrompt } from "./content/RetrievalPrompt";
import { OccupiedPawExplorable } from "./explorables/occupied-paw/OccupiedPawExplorable";
import { SameHillExplorable } from "./explorables/same-hill/SameHillExplorable";
import { WillametteSoilsExplorable } from "./explorables/willamette-soils/WillametteSoilsExplorable";
import { lessonFromHash, type LessonId } from "./lesson-route";
import type { LessonFrontmatter } from "./schemas/content";

const soilsLesson = soilsFrontmatter as unknown as LessonFrontmatter;
const occupiedLesson = occupiedFrontmatter as unknown as LessonFrontmatter;
const sameHillLesson = sameHillFrontmatter as unknown as LessonFrontmatter;

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

function SameHillRetrievalPrompt() {
  const prompt = sameHillLesson.prompts?.[0];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

function LessonNav({ lessonId }: { lessonId: LessonId }) {
  return (
    <nav className="lesson-nav" aria-label="Lessons">
      <a href="#/" aria-current={lessonId === "willamette-soils" ? "page" : undefined}>
        Willamette soils
      </a>
      <a
        href="#/occupied-root-zone"
        aria-current={lessonId === "occupied-root-zone" ? "page" : undefined}
      >
        Occupied root zone
      </a>
      <a href="#/same-hill" aria-current={lessonId === "same-hill" ? "page" : undefined}>
        Same hill
      </a>
    </nav>
  );
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

  return (
    <main>
      <h1>Vintner explorables</h1>
      <LessonNav lessonId={lessonId} />
      {lessonId === "occupied-root-zone" ? (
        <OccupiedLesson
          components={{
            OccupiedPaw: OccupiedPawExplorable,
            RetrievalPrompt: OccupiedRetrievalPrompt,
          }}
        />
      ) : lessonId === "same-hill" ? (
        <SameHillLesson
          components={{
            SameHill: SameHillExplorable,
            RetrievalPrompt: SameHillRetrievalPrompt,
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
