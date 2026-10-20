import { useMemo, useRef, useState } from "react";
import type { ProblemContent } from "../../data/problems";
import type { ProblemRef } from "../../data/tracks";
import { useMedia } from "../../hooks/useMedia";
import { useApp } from "../../state/AppState";
import { useAssistantWindow } from "../assistant/hooks/useAssistantWindow";
import ConsolePane from "./console/ConsolePane";
import type { EditorHandle, EditorSnapshot } from "./editor/Editor";
import EditorPane from "./editor/EditorPane";
import HeaderActions from "./header/HeaderActions";
import ProblemMeta from "./header/ProblemMeta";
import WorkspaceHeader from "./header/WorkspaceHeader";
import { useCaseDrafts } from "./hooks/useCaseDrafts";
import { useClaudeHandoff } from "./hooks/useClaudeHandoff";
import { useDraft } from "./hooks/useDraft";
import { useLineJump } from "./hooks/useLineJump";
import { useRunSession } from "./hooks/useRunSession";
import { useScrollIntoView } from "./hooks/useScrollIntoView";
import { useClock } from "./hooks/useStopwatch";
import { useStuckNudge } from "./hooks/useStuckNudge";
import { useOneShot } from "./hooks/useOneShot";
import { useWorkspacePrefs } from "./hooks/useWorkspacePrefs";
import { useWorkspaceShortcuts } from "./hooks/useWorkspaceShortcuts";
import DesktopLayout from "./layout/DesktopLayout";
import MobileLayout, { type MobileTab } from "./layout/MobileLayout";
import { HINTS, nextRung } from "./lib/ladder";
import { nextProblem } from "./lib/nextProblem";
import { parseNotes } from "./lib/notes";
import { carriedCode, stepPlace } from "./lib/steps";
import LazyAssistant from "./LazyAssistant";
import ProblemPane from "./problem/ProblemPane";
import StepTrack from "./problem/StepTrack";
import StuckNudge from "./problem/StuckNudge";

interface WorkspaceBodyProps {
  problemRef: ProblemRef;
  content: ProblemContent;
}

export default function WorkspaceBody({ problemRef, content }: WorkspaceBodyProps) {
  const { state, actions } = useApp();
  const { spec } = content;
  const pid = problemRef.prob.id;
  const progress = state.data.tracks[problemRef.track];
  const done = !!progress.done[pid];
  const accepted = !!progress.accepted[pid];
  /* From the progress as it stands, so a problem ticked elsewhere in the meantime is not offered. */
  const next = nextProblem(problemRef, progress.done);
  const place = stepPlace(problemRef);
  const nextIsStep = !!next && place?.steps[place.at + 1]?.id === next.id;
  const wide = useMedia("(min-width: 900px)");

  const prefs = useWorkspacePrefs();
  /* Read once, on opening: a step with no draft of its own starts from the step before. */
  const [carried] = useState(() => carriedCode(place));
  const draft = useDraft(pid, spec.starter, carried);
  const caseDrafts = useCaseDrafts(spec);
  const [problemTab, setProblemTab] = useState<"desc" | "solution">("desc");
  const [consoleTab, setConsoleTab] = useState<"cases" | "result">("cases");
  const [mobileTab, setMobileTab] = useState<MobileTab>("problem");
  const [revealed, setRevealed] = useState(false);
  const [hints, setHints] = useState(0);
  /* Crossing 900px swaps layouts and remounts the panes; what must survive that lives here. */
  const editorSnapshot = useRef<EditorSnapshot | null>(null);
  /* The editor fills it while it is mounted; Bana's line numbers move its cursor through it. */
  const editorHandle = useRef<EditorHandle | null>(null);
  const clock = useClock();
  const open = accepted || revealed;
  const notes = useMemo(() => parseNotes(content.notes), [content.notes]);
  const ladder = useRef<HTMLDivElement>(null);
  const showLadder = useScrollIntoView(ladder);
  const nudge = useStuckNudge({ clock, active: notes !== null && !open, hints });

  const session = useRunSession({
    pid,
    content,
    code: draft.code,
    cases: caseDrafts.cases,
    onStart: () => {
      draft.save();
      setConsoleTab("result");
      if (!wide) setMobileTab("tests");
    },
  });
  const oneShot = useOneShot(pid, session.run, accepted);
  const assistantWindow = useAssistantWindow();
  const goToLine = useLineJump({ editor: editorHandle, wide, hideAssistant: assistantWindow.hide, onTab: setMobileTab });
  const claude = useClaudeHandoff({ content, code: draft.code, run: session.run });
  useWorkspaceShortcuts({
    start: session.start,
    closeWork: actions.closeWork,
    showAssistant: assistantWindow.show,
    hideAssistant: assistantWindow.hide,
  });

  const runCases = () => session.start("run");
  const submit = () => session.start("submit");
  /* Saved first: the next problem reads this draft as it opens, before this body unmounts and saves on its own. */
  const openOther = (id: string) => {
    draft.save();
    actions.openWork(id);
  };

  /* The ladder's button and the nudge's: the next hint, then the solution; once that is open, just its tab. */
  const climb = () => {
    if (!open && hints < HINTS) {
      setHints(hints + 1);
    } else {
      setRevealed(true);
      setProblemTab("solution");
    }
  };
  const takeNudge = () => {
    climb();
    if (hints < HINTS) setProblemTab("desc");
    if (!wide) setMobileTab("problem");
    showLadder();
  };

  const problemPane = (
    <ProblemPane
      content={content}
      notes={notes}
      tab={problemTab}
      onTab={setProblemTab}
      open={open}
      onReveal={() => setRevealed(true)}
      hints={hints}
      onClimb={climb}
      ladderRef={ladder}
      fontSize={prefs.font}
      steps={
        place && (
          <StepTrack
            steps={place.steps}
            at={place.at}
            done={progress.done}
            carriedFrom={draft.carriedFrom}
            onOpen={openOther}
          />
        )
      }
    />
  );
  const editorPane = (
    <EditorPane
      title={spec.title}
      code={draft.code}
      docKey={draft.docKey}
      onChange={draft.onChange}
      onRun={runCases}
      onSubmit={submit}
      run={session.run}
      fontSize={prefs.font}
      onFontStep={prefs.stepFont}
      onReset={draft.reset}
      resetTitle={draft.resetTitle}
      snapshot={editorSnapshot}
      handle={editorHandle}
    />
  );
  const consolePane = (
    <ConsolePane
      spec={spec}
      cases={caseDrafts.cases}
      onCases={caseDrafts.setCases}
      activeCase={caseDrafts.activeCase}
      onActiveCase={caseDrafts.setActiveCase}
      tab={consoleTab}
      onTab={setConsoleTab}
      run={session.run}
      next={next}
      nextIsStep={nextIsStep}
      onNext={openOther}
    />
  );
  const assistant = (
    <LazyAssistant
      loaded={assistantWindow.loaded}
      open={assistantWindow.open}
      summon={assistantWindow.summon}
      onClose={assistantWindow.hide}
      context={claude.readContext}
      oneShot={oneShot}
      wide={wide}
      onLine={goToLine}
    />
  );

  return (
    <>
      <WorkspaceHeader
        title={spec.title}
        onClose={actions.closeWork}
        meta={<ProblemMeta spec={spec} problemRef={problemRef} done={done} accepted={accepted} />}
        actions={
          <HeaderActions
            wide={wide}
            clock={clock}
            asking={assistantWindow.open}
            onAsk={assistantWindow.toggle}
            copied={claude.copied}
            onCopy={claude.copyForClaude}
            busy={session.busy}
            onRun={runCases}
            onStop={session.stop}
            onSubmit={submit}
          />
        }
      />
      {wide ? (
        <DesktopLayout
          splitX={prefs.splitX}
          splitY={prefs.splitY}
          onSplitX={prefs.setSplitX}
          onSplitY={prefs.setSplitY}
          onCommitSplits={prefs.commitSplits}
          problem={problemPane}
          editor={editorPane}
          tests={consolePane}
        />
      ) : (
        <MobileLayout
          tab={mobileTab}
          onTab={setMobileTab}
          busy={session.busy}
          verdict={session.run?.verdict ?? null}
          problem={problemPane}
          editor={editorPane}
          tests={consolePane}
        />
      )}
      {nudge.minutes !== null && (
        <StuckNudge minutes={nudge.minutes} action={nextRung(hints)} onTake={takeNudge} onLater={nudge.postpone} />
      )}
      {assistant}
    </>
  );
}
