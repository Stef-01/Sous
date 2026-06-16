"use client";

import { useCallback, useMemo, useState } from "react";
import { SurveyShell } from "./survey-shell";
import { OptionRow } from "./option-row";
import { MultiSelect } from "./check-row";
import { ChipCloud } from "./chip-cloud";
import { StatementSwipe } from "./statement-swipe";
import { ThumbRows } from "./thumb-row";
import { PhotoTileGrid } from "./photo-tile-grid";
import { GlyphGrid } from "./glyph-grid";
import { WheelPicker } from "./wheel-picker";
import { Interstitial } from "./interstitial";
import { MirrorSummary } from "./mirror-summary";
import {
  computeSurveySignals,
  type AggregatedSignals,
} from "@/lib/surveys/compute-survey-signals";
import { getVisibleSteps, isStepAnswered } from "@/lib/surveys/survey-logic";
import type {
  SurveyAnswers,
  SurveyAnswerValue,
  SurveyDef,
  SurveyStep,
} from "@/types/survey";

/**
 * SurveyRunner — the single engine that drives a SurveyDef (planning.md §6.2
 * W1). Owns answer state, back / skip, and `showIf` branch steps; renders each
 * step kind in the SurveyShell and emits `(answers, signals)` on completion.
 * Onboarding (W3) and one-screen pulses (W4) both run through this.
 */
export function SurveyRunner({
  def,
  onComplete,
  onExit,
}: {
  def: SurveyDef;
  onComplete: (answers: SurveyAnswers, signals: AggregatedSignals) => void;
  /** Back from the first step (e.g. close the sheet). Optional. */
  onExit?: () => void;
}) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentId, setCurrentId] = useState<string>(def.steps[0]?.id ?? "");

  // Steps whose branch predicate passes for the current answers.
  const visibleSteps = useMemo(
    () => getVisibleSteps(def.steps, answers),
    [def.steps, answers],
  );

  const currentIndex = Math.max(
    0,
    visibleSteps.findIndex((s) => s.id === currentId),
  );
  const step = visibleSteps[currentIndex] ?? visibleSteps[0];

  const setAnswer = useCallback((id: string, value: SurveyAnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goNext = useCallback(() => {
    const next = visibleSteps[currentIndex + 1];
    if (next) {
      setCurrentId(next.id);
    } else {
      onComplete(answers, computeSurveySignals(visibleSteps, answers));
    }
  }, [visibleSteps, currentIndex, answers, onComplete]);

  const goBack = useCallback(() => {
    const prev = visibleSteps[currentIndex - 1];
    if (prev) setCurrentId(prev.id);
    else onExit?.();
  }, [visibleSteps, currentIndex, onExit]);

  if (!step) return null;

  const value = answers[step.id];
  const answered = isStepAnswered(step, value);
  const isLast = currentIndex === visibleSteps.length - 1;
  const stepOptional = "optional" in step ? !!step.optional : false;
  const ctaLabel =
    step.kind === "mirror" ? step.ctaLabel : isLast ? "Finish" : "Continue";
  const ctaDisabled = !answered && !stepOptional;
  const showSkip = stepOptional && !answered && step.kind !== "mirror";
  // Interstitials render their own centered headline; every other kind
  // (mirror included) shows its title in the shell's left-aligned slot.
  const shellTitle =
    step.kind === "interstitial"
      ? ""
      : "title" in step
        ? (step.title ?? "")
        : "";

  return (
    <SurveyShell
      title={shellTitle}
      subtitle={"subtitle" in step ? step.subtitle : undefined}
      stepIndex={currentIndex}
      stepCount={visibleSteps.length}
      onBack={goBack}
      canBack={currentIndex > 0 || !!onExit}
      ctaLabel={ctaLabel}
      onCta={goNext}
      ctaDisabled={ctaDisabled}
      secondaryLabel={showSkip ? "Skip" : undefined}
      onSecondary={showSkip ? goNext : undefined}
    >
      <StepBody step={step} value={value} setAnswer={setAnswer} />
    </SurveyShell>
  );
}

function StepBody({
  step,
  value,
  setAnswer,
}: {
  step: SurveyStep;
  value: SurveyAnswerValue | undefined;
  setAnswer: (id: string, value: SurveyAnswerValue) => void;
}) {
  switch (step.kind) {
    case "single":
    case "likert":
      return (
        <div className="flex flex-col gap-[var(--row-gap)]">
          {step.options.map((o) => (
            <OptionRow
              key={o.value}
              label={o.label}
              glyph={o.glyph}
              subtext={o.subtext}
              recommended={o.recommended}
              selected={value === o.value}
              onSelect={() => setAnswer(step.id, o.value)}
            />
          ))}
        </div>
      );
    case "multi":
      return (
        <MultiSelect
          options={step.options}
          value={(value as string[]) ?? []}
          noneValue={step.noneValue}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "chips":
      return (
        <ChipCloud
          options={step.options}
          value={(value as string[]) ?? []}
          noneValue={step.noneValue}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "statements":
      return (
        <StatementSwipe
          statements={step.statements}
          value={(value as Record<string, boolean>) ?? {}}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "thumbs":
      return (
        <ThumbRows
          rows={step.rows}
          value={(value as Record<string, "like" | "dislike">) ?? {}}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "photo-tiles":
      return (
        <PhotoTileGrid
          options={step.options}
          value={(value as string[]) ?? []}
          multi={step.multi}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "glyph-grid":
      return (
        <GlyphGrid
          options={step.options}
          value={(value as string[]) ?? []}
          mode={step.mode}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "wheel":
      return (
        <WheelPicker
          min={step.min}
          max={step.max}
          step={step.step}
          value={(value as number) ?? step.default}
          unit={step.unit}
          units={step.units}
          onChange={(next) => setAnswer(step.id, next)}
        />
      );
    case "interstitial":
      return (
        <Interstitial
          glyph={step.glyph}
          eyebrow={step.eyebrow}
          title={step.title}
          body={step.body}
          caption={step.caption}
        />
      );
    case "mirror":
      return <MirrorSummary cards={step.cards} />;
    default:
      return null;
  }
}
