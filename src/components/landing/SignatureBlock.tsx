import Image from "next/image";
import { SmallCapsEyebrow } from "./SmallCapsEyebrow";

/**
 * Closing element of the founder note. Optional headshot,
 * name in small caps, role in Fraunces italic, scribble mark in
 * --accent. Falls back to no-photo if headshotSrc is omitted.
 */
export function SignatureBlock({
  name,
  role,
  headshotSrc,
  headshotAlt,
}: {
  name: string;
  role: string;
  headshotSrc?: string;
  headshotAlt?: string;
}) {
  return (
    <div className="mt-10 flex items-center gap-4">
      {headshotSrc && (
        <Image
          src={headshotSrc}
          alt={headshotAlt ?? `${name}, ${role}`}
          width={64}
          height={64}
          className="rounded-full grayscale"
          loading="lazy"
          fetchPriority="low"
        />
      )}
      <div className="flex-1">
        <SmallCapsEyebrow>{name}</SmallCapsEyebrow>
        <p className="font-display italic text-[16px] text-ink-2 mt-1">
          {role}
        </p>
        <div className="mt-2 text-accent opacity-50">
          <svg
            viewBox="0 0 160 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={80}
            height={24}
            aria-hidden="true"
          >
            <path d="M 8 32 C 18 18, 32 12, 44 22 S 64 38, 76 28 S 96 12, 110 24 S 134 38, 152 28" />
            <path d="M 28 38 L 36 38" />
          </svg>
        </div>
      </div>
    </div>
  );
}
