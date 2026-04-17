"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { markTourSeen } from "@/app/actions/tour";

interface Props {
  /** Whether the tour should auto-start on mount */
  autoStart: boolean;
}

// ── Steps ────────────────────────────────────────────────────────────────────

const STEPS: DriveStep[] = [
  {
    popover: {
      title:       "Willkommen bei Wellbeing Workbook 👋",
      description: "In 60 Sekunden zeigen wir dir, wie du deinen Traumraum gestaltest.",
      showButtons: ["next", "close"],
      nextBtnText: "Los geht's!",
    },
  },
  {
    element: '[data-tour="nav-projekte"]',
    popover: {
      title:       "Deine Projekte",
      description: "Hier findest du alle deine Raumkonzepte — ein Projekt kann mehrere Räume haben.",
      side:        "bottom",
      align:       "start",
    },
  },
  {
    element: '[data-tour="new-project"]',
    popover: {
      title:       "Neues Projekt starten",
      description: "Starte hier dein erstes Raumkonzept. Wähle Raumtyp, Budget und Wunschdatum.",
      side:        "bottom",
      align:       "end",
    },
  },
  {
    element: '[data-tour="modul-overview"]',
    popover: {
      title:       "Modul 1 — das Herzstück",
      description: "In 11 geführten Schritten entwickelst du ein komplettes Raumkonzept: Wirkung, Farben, Materialien, Moodboard.",
      side:        "top",
    },
  },
  {
    element: '[data-tour="nav-inspiration"]',
    popover: {
      title:       "Inspiration",
      description: "Lass dich von hunderten Bildern inspirieren. Speichere Favoriten und erstelle eigene Sammlungen.",
      side:        "bottom",
    },
  },
  {
    element: '[data-tour="nav-shopping"]',
    popover: {
      title:       "Shopping-Listen",
      description: "Sammle Produkte in thematischen Listen — und behalte dein Budget immer im Blick.",
      side:        "bottom",
    },
  },
  {
    element: '[data-tour="nav-favoriten"]',
    popover: {
      title:       "Favoriten",
      description: "Alle gemerkten Produkte findest du hier — jederzeit griffbereit.",
      side:        "bottom",
    },
  },
  {
    popover: {
      title:       "Du bist startklar! 🎉",
      description: "<strong>Tipp:</strong> Starte mit einem kleinen Raum wie dem Bad — so lernst du die App schnell kennen.<br/><br/>Viel Spaß beim Gestalten!",
      showButtons: ["next", "close"],
      nextBtnText: "Erstes Projekt erstellen",
    },
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function WelcomeTour({ autoStart }: Props) {
  const router      = useRouter();
  const driverRef   = useRef<Driver | null>(null);
  const startedRef  = useRef(false);

  useEffect(() => {
    if (!autoStart) return;
    if (startedRef.current) return;
    startedRef.current = true;

    // Give the page a moment to settle so element positions are stable.
    const timer = setTimeout(() => startTour(), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  function startTour() {
    if (driverRef.current) driverRef.current.destroy();

    const d = driver({
      showProgress:       true,
      allowClose:         true,
      overlayOpacity:     0.65,
      stagePadding:       6,
      stageRadius:        12,
      smoothScroll:       true,
      nextBtnText:        "Weiter",
      prevBtnText:        "Zurück",
      doneBtnText:        "Fertig",
      progressText:       "{{current}} / {{total}}",
      showButtons:        ["next", "previous", "close"],
      disableActiveInteraction: true,
      steps:              STEPS,
      onDestroyStarted:   () => {
        // User clicked close or skipped — mark as seen anyway
        void markTourSeen();
        d.destroy();
      },
      onDestroyed: () => {
        // Tour finished normally — mark as seen
        void markTourSeen();

        // If the user was on the "done" step, redirect to new-project
        // when they clicked the primary CTA. driver.js's "done" button
        // calls destroy(), so we detect by checking the last active step.
        if (lastStepWasDone.current) {
          router.push("/dashboard/projekte/neu");
        }
      },
      onNextClick: (_el, step, opts) => {
        const isLast = opts.state.activeIndex === STEPS.length - 1;
        if (isLast) {
          lastStepWasDone.current = true;
        }
        d.moveNext();
      },
    });

    driverRef.current = d;
    d.drive();
  }

  const lastStepWasDone = useRef(false);

  // Expose a global trigger so the Einstellungen page can re-play the tour
  // without re-navigating. The settings page writes `data-reset-tour` on
  // <body> (via server action) and then reloads — on mount the `autoStart`
  // prop is driven by the server-rendered flag, which will be false again.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__startWelcomeTour = () => startTour();
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__startWelcomeTour;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
