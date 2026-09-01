import { useEffect, useState } from "react";
import OccupiedLesson, {
  frontmatter as occupiedFrontmatter,
} from "../content/occupied-root-zone.mdx";
import SameHillLesson, {
  frontmatter as sameHillFrontmatter,
} from "../content/same-hill.mdx";
import TwoHundredKLesson, {
  frontmatter as twoHundredKFrontmatter,
} from "../content/two-hundred-k.mdx";
import SoilsLesson, {
  frontmatter as soilsFrontmatter,
} from "../content/willamette-soils.mdx";
import { RetrievalPrompt } from "./content/RetrievalPrompt";
import { OccupiedPawExplorable } from "./explorables/occupied-paw/OccupiedPawExplorable";
import { SameHillExplorable } from "./explorables/same-hill/SameHillExplorable";
import { TwoHundredKExplorable } from "./explorables/two-hundred-k/TwoHundredKExplorable";
import { WillametteSoilsExplorable } from "./explorables/willamette-soils/WillametteSoilsExplorable";
import { lessonFromHash, type LessonId } from "./lesson-route";
import type { LessonFrontmatter } from "./schemas/content";

const soilsLesson = soilsFrontmatter as unknown as LessonFrontmatter;
const occupiedLesson = occupiedFrontmatter as unknown as LessonFrontmatter;
const sameHillLesson = sameHillFrontmatter as unknown as LessonFrontmatter;
const twoHundredKLesson = twoHundredKFrontmatter as unknown as LessonFrontmatter;

function SoilsRetrievalPrompt({ index = 0 }: { index?: number }) {
  const prompt = soilsLesson.prompts?.[index];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

function OccupiedRetrievalPrompt({ index = 0 }: { index?: number }) {
  const prompt = occupiedLesson.prompts?.[index];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

function SameHillRetrievalPrompt({ index = 0 }: { index?: number }) {
  const prompt = sameHillLesson.prompts?.[index];
  if (!prompt) return null;
  return <RetrievalPrompt prompt={prompt} />;
}

function TwoHundredKRetrievalPrompt({ index = 0 }: { index?: number }) {
  const prompt = twoHundredKLesson.prompts?.[index];
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
      <a
        href="#/two-hundred-k"
        aria-current={lessonId === "two-hundred-k" ? "page" : undefined}
      >
        $200k from Portland
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
      ) : lessonId === "two-hundred-k" ? (
        <TwoHundredKLesson
          components={{
            TwoHundredK: TwoHundredKExplorable,
            RetrievalPrompt: TwoHundredKRetrievalPrompt,
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
