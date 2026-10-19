import { useEffect, useState } from "react";
import { hasProblem, loadProblem, type ProblemContent } from "../../../data/problems";
import * as runner from "../../../runner/runner";

/** undefined while loading; null when the problem has no in-app version. Warms the Python runner as the load starts. */
export function useProblemContent(specId: string | null): ProblemContent | null | undefined {
  /* Tagged with whose it is, so moving on to another problem never shows the last one's content while the next loads. */
  const [loaded, setLoaded] = useState<{ specId: string | null; content: ProblemContent | null }>();

  useEffect(() => {
    let live = true;
    if (!hasProblem(specId)) {
      setLoaded({ specId, content: null });
      return;
    }
    void runner.warm().catch(() => {});
    void loadProblem(specId).then((content) => {
      if (live) setLoaded({ specId, content });
    });
    return () => {
      live = false;
    };
  }, [specId]);

  return loaded?.specId === specId ? loaded.content : undefined;
}
