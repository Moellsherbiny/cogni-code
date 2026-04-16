"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

type Props = {
  rate: number;
  pitch: number;
  onRateChange: (v: number) => void;
  onPitchChange: (v: number) => void;
  locale: string;
};

export function SpeedSettings({
  rate,
  pitch,
  onRateChange,
  onPitchChange,
  locale,
}: Props) {
  const t = useTranslations("accessibleLearn");

  return (
    <div
      className="bg-neutral-900 border-b border-neutral-800 px-4 py-4"
      role="region"
      aria-label={t("settings.ariaLabel")}
    >
      <div className="max-w-lg mx-auto space-y-4">
        <h2 className="text-sm font-semibold text-neutral-300">
          {t("settings.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Speech rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="speech-rate"
                className="text-xs text-neutral-400"
              >
                {t("settings.rate")}
              </label>
              <span className="text-xs font-mono text-indigo-400">
                {rate.toFixed(1)}x
              </span>
            </div>
            <Slider
              id="speech-rate"
              min={0.5}
              max={2}
              step={0.1}
              value={[rate]}
              onValueChange={([v]) => onRateChange(v)}
              aria-label={t("settings.rate")}
              aria-valuemin={0.5}
              aria-valuemax={2}
              aria-valuenow={rate}
              className="**:[[role=slider]]:bg-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>{t("settings.slow")}</span>
              <span>{t("settings.fast")}</span>
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="speech-pitch"
                className="text-xs text-neutral-400"
              >
                {t("settings.pitch")}
              </label>
              <span className="text-xs font-mono text-indigo-400">
                {pitch.toFixed(1)}
              </span>
            </div>
            <Slider
              id="speech-pitch"
              min={0.5}
              max={2}
              step={0.1}
              value={[pitch]}
              onValueChange={([v]) => onPitchChange(v)}
              aria-label={t("settings.pitch")}
              aria-valuemin={0.5}
              aria-valuemax={2}
              aria-valuenow={pitch}
              className="**:[[role=slider]]:bg-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-600">
              <span>{t("settings.low")}</span>
              <span>{t("settings.high")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}