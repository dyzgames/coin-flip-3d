import type { CoinResult } from "../physics/flip";

const STORAGE_KEY = "coin3d.stats.v1";

type Stats = Record<CoinResult, number>;

function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cara: 0, cruz: 0, lado: 0 };
    const parsed = JSON.parse(raw);
    return {
      cara: Number(parsed.cara) || 0,
      cruz: Number(parsed.cruz) || 0,
      lado: Number(parsed.lado) || 0,
    };
  } catch {
    return { cara: 0, cruz: 0, lado: 0 };
  }
}

function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // storage unavailable (private mode, quota) — stats just won't persist
  }
}

const RESULT_LABEL: Record<CoinResult, string> = {
  cara: "¡Cara!",
  cruz: "¡Cruz!",
  lado: "¡De lado!",
};

const RESULT_SUB: Record<CoinResult, string> = {
  cara: "La moneda cayó de cara",
  cruz: "La moneda cayó de cruz",
  lado: "Rarísimo — ha quedado de canto",
};

export class Hud {
  private resultLabel = document.getElementById("resultLabel") as HTMLElement;
  private resultSub = document.getElementById("resultSub") as HTMLElement;
  private flipBtn = document.getElementById("flipBtn") as HTMLButtonElement;
  private resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
  private soundToggle = document.getElementById("soundToggle") as HTMLButtonElement;
  private hint = document.getElementById("hint") as HTMLElement;
  private statEls: Record<CoinResult, HTMLElement> = {
    cara: document.getElementById("statCara") as HTMLElement,
    cruz: document.getElementById("statCruz") as HTMLElement,
    lado: document.getElementById("statLado") as HTMLElement,
  };

  private stats: Stats = loadStats();

  constructor() {
    this.renderStats();
  }

  onFlip(handler: () => void): void {
    this.flipBtn.addEventListener("click", handler);
  }

  onReset(handler: () => void): void {
    this.resetBtn.addEventListener("click", () => {
      this.stats = { cara: 0, cruz: 0, lado: 0 };
      saveStats(this.stats);
      this.renderStats();
      handler();
    });
  }

  onSoundToggle(handler: (muted: boolean) => void): void {
    this.soundToggle.addEventListener("click", () => {
      const nextMuted = this.soundToggle.getAttribute("aria-pressed") !== "true";
      this.soundToggle.setAttribute("aria-pressed", String(nextMuted));
      handler(nextMuted);
    });
  }

  setFlipping(isFlipping: boolean): void {
    this.flipBtn.disabled = isFlipping;
    this.flipBtn.textContent = isFlipping ? "En el aire…" : "Lanzar moneda";
    if (isFlipping) {
      this.resultLabel.textContent = "Girando…";
      this.resultLabel.classList.add("is-pending");
      this.resultSub.textContent = "";
    }
    this.hint.classList.add("is-hidden");
  }

  showResult(result: CoinResult): void {
    this.resultLabel.textContent = RESULT_LABEL[result];
    this.resultLabel.classList.remove("is-pending");
    this.resultSub.textContent = RESULT_SUB[result];
    this.stats[result] += 1;
    saveStats(this.stats);
    this.renderStats();
  }

  private renderStats(): void {
    (Object.keys(this.statEls) as CoinResult[]).forEach((key) => {
      this.statEls[key].textContent = String(this.stats[key]);
    });
  }
}
