"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  MANUFACTURER,
  POOLED_ORDER,
  POOLED_PIECES,
  ROSTER,
  STEWARD,
  type PooledMaterials,
  type PooledPiece,
} from "@/lib/data";
import { lockAppScroll } from "@/lib/appScrollLock";
import { PhoneOverlay } from "./PhoneOverlay";
import { PassportPanel, type PassportTechnicalExtra } from "./PassportPanel";

type ManufacturerScreen = "order" | "passport";

type Props = {
  screen: ManufacturerScreen;
  onScreen: (screen: ManufacturerScreen) => void;
};

const TRACE_CHIPS = ["SH-07", "SH-23", "SH-38"] as const;

const MAKER_STYLES = [
  { tile: "bg-fm-blue text-fm-ink", bar: "bg-fm-blue" },
  { tile: "bg-fm-green text-fm-ink", bar: "bg-fm-green" },
  { tile: "bg-fm-pink text-white", bar: "bg-fm-pink" },
  { tile: "bg-fm-orange text-fm-ink", bar: "bg-fm-orange" },
  { tile: "bg-fm-purple text-white", bar: "bg-fm-purple" },
] as const;

const MISSING_PIECE = "No piece with that ID in this order.";

function resolveMaker(makerId: string) {
  const assigned = POOLED_ORDER.makers.find((maker) => maker.id === makerId);
  const roster = ROSTER.find((artisan) => artisan.id === makerId);
  return {
    id: makerId,
    name: roster?.name ?? assigned?.name ?? "Unknown maker",
    village: roster?.village ?? assigned?.village ?? "",
    pieces: assigned?.pieces ?? 0,
  };
}

function makerStyle(makerId: string) {
  const index = POOLED_ORDER.makers.findIndex((maker) => maker.id === makerId);
  return MAKER_STYLES[index] ?? MAKER_STYLES[0];
}

function piecesLabel(count: number) {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

function pieceSummary(piece: PooledPiece) {
  const maker = resolveMaker(piece.makerId);
  const number = Number(piece.id.slice(3));
  return `Piece ${number} of ${POOLED_ORDER.totalPieces} in order ${POOLED_ORDER.code}. Made by ${maker.name}, ${maker.village}.`;
}

function technicalFor(piece: PooledPiece, materials: PooledMaterials): PassportTechnicalExtra {
  const maker = resolveMaker(piece.makerId);
  return {
    pieceId: piece.id,
    makerArtisanId: maker.id,
    orderCode: POOLED_ORDER.code,
    carton: `Carton ${piece.carton}`,
    materials,
  };
}

function copyMaterials(): PooledMaterials {
  return {
    yarn: POOLED_ORDER.materials.yarn,
    yarnSource: POOLED_ORDER.materials.yarnSource,
    dye: POOLED_ORDER.materials.dye,
  };
}

function traceMatch(raw: string) {
  const key = raw.trim().toUpperCase();
  if (!key) return null;
  const piece = POOLED_PIECES.find((item) => item.id === key);
  if (!piece) return null;
  const maker = resolveMaker(piece.makerId);
  return {
    id: piece.id,
    text: `${piece.id} was made by ${maker.name}, ${maker.village}, and is in Carton ${piece.carton}.`,
  };
}

export function ManufacturerExperience({ screen, onScreen }: Props) {
  const [screenSeen, setScreenSeen] = useState(screen);
  const [selectedId, setSelectedId] = useState("SH-17");
  const [openPieceId, setOpenPieceId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<PooledMaterials>(copyMaterials);
  const [draft, setDraft] = useState<PooledMaterials | null>(null);
  const [traceInput, setTraceInput] = useState("");
  const [traceMessage, setTraceMessage] = useState<string | null>(null);
  const [traceFound, setTraceFound] = useState(false);

  if (screen !== screenSeen) {
    setScreenSeen(screen);
    setOpenPieceId(null);
  }

  const closeSheet = useCallback(() => setOpenPieceId(null), []);

  const openPassport = useCallback(
    (pieceId: string) => {
      setSelectedId(pieceId);
      setOpenPieceId(null);
      onScreen("passport");
    },
    [onScreen],
  );

  const selected =
    POOLED_PIECES.find((piece) => piece.id === selectedId) ?? POOLED_PIECES[0];
  const openPiece = POOLED_PIECES.find((piece) => piece.id === openPieceId) ?? null;

  function applyTrace(raw: string) {
    const match = traceMatch(raw);
    if (!match) {
      setTraceInput(raw.trim());
      setTraceFound(false);
      setTraceMessage(MISSING_PIECE);
      return;
    }
    setTraceInput(match.id);
    setTraceFound(true);
    setTraceMessage(match.text);
  }

  function saveMaterials(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setMaterials({
      yarn: draft.yarn.trim(),
      yarnSource: draft.yarnSource.trim(),
      dye: draft.dye.trim(),
    });
    setDraft(null);
  }

  return (
    <div>
      {screen === "order" && (
        <div>
          <p className="font-display text-2xl font-semibold text-fm-ink">{MANUFACTURER.name}</p>
          <p className="mt-1 text-fm-ink">{MANUFACTURER.org}</p>
          <p className="text-fm-muted">{MANUFACTURER.area}</p>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="font-display text-xl font-semibold text-fm-ink">{POOLED_ORDER.code}</h1>
              <span className="inline-flex shrink-0 rounded-full border border-fm-green/25 bg-fm-green-soft px-2.5 py-1 text-xs font-semibold text-fm-green">
                {POOLED_ORDER.stage}
              </span>
            </div>
            <p className="mt-2 text-fm-ink">{POOLED_ORDER.product}</p>
            <p className="mt-1 text-fm-ink">Buyer: {POOLED_ORDER.buyer}</p>
            <p className="mt-1 text-fm-ink">
              {POOLED_ORDER.totalPieces} pieces from {POOLED_ORDER.makers.length} weavers
            </p>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <h2 className="font-display text-lg font-semibold text-fm-ink">Who made this order</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {POOLED_ORDER.makers.map((maker) => {
                const profile = resolveMaker(maker.id);
                const width = (maker.pieces / POOLED_ORDER.totalPieces) * 100;
                return (
                  <li key={maker.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 text-fm-ink">
                        <span className="font-semibold">{profile.name}</span>
                        <span className="text-fm-muted">, {profile.village}</span>
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-fm-ink">
                        {piecesLabel(maker.pieces)}
                      </p>
                    </div>
                    <div
                      className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200"
                      aria-hidden
                    >
                      <div
                        className={`h-full rounded-full ${makerStyle(maker.id).bar}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <h2 className="font-display text-lg font-semibold text-fm-ink">Every piece</h2>
            <ul className="mt-3 grid list-none grid-cols-8 gap-1.5 p-0">
              {POOLED_PIECES.map((piece) => {
                const maker = resolveMaker(piece.makerId);
                return (
                  <li key={piece.id}>
                    <button
                      type="button"
                      onClick={() => setOpenPieceId(piece.id)}
                      className={`flex aspect-square w-full items-center justify-center rounded-md text-[11px] font-bold ${makerStyle(piece.makerId).tile}`}
                      aria-label={`${piece.id}, ${maker.name}, ${maker.village}`}
                    >
                      {piece.id.slice(3)}
                    </button>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-3 flex list-none flex-wrap gap-x-3 gap-y-2 p-0">
              {POOLED_ORDER.makers.map((maker) => (
                <li key={maker.id} className="flex items-center gap-1.5 text-xs text-fm-ink">
                  <span
                    className={`h-3 w-3 rounded-sm ${makerStyle(maker.id).bar}`}
                    aria-hidden
                  />
                  {resolveMaker(maker.id).name}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <h2 className="font-display text-lg font-semibold text-fm-ink">Shipment</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {POOLED_ORDER.cartons.map((carton) => (
                <li key={carton.id}>
                  <p className="font-semibold text-fm-ink">{carton.id}</p>
                  <p className="text-sm text-fm-muted">{carton.pieces}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-snug text-fm-ink">
              Pieces are pooled into cartons, but each piece keeps its own label and passport.
            </p>
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <h2 className="font-display text-lg font-semibold text-fm-ink">Trace a piece</h2>
            <form
              className="mt-3"
              onSubmit={(event) => {
                event.preventDefault();
                applyTrace(traceInput);
              }}
            >
              <label htmlFor="trace-piece" className="block text-sm font-medium text-fm-ink">
                Piece ID
              </label>
              <div className="mt-2 flex flex-col gap-3">
                <input
                  id="trace-piece"
                  type="text"
                  value={traceInput}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="e.g. SH-23"
                  onChange={(event) => {
                    const value = event.target.value;
                    setTraceInput(value);
                    const match = traceMatch(value);
                    if (match) {
                      setTraceFound(true);
                      setTraceMessage(match.text);
                    } else {
                      setTraceMessage(null);
                    }
                  }}
                  className="min-h-[48px] w-full rounded-xl border-2 border-slate-200 px-4 text-base text-fm-ink placeholder:text-slate-400 focus:border-fm-blue focus:outline-none"
                />
                <button type="submit" className="btn-primary min-h-[48px] font-semibold">
                  Trace
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRACE_CHIPS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => applyTrace(id)}
                    className="min-h-[44px] rounded-full border border-fm-blue/30 bg-fm-btn-light px-4 text-sm font-semibold text-fm-btn-text"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </form>
            {traceMessage && (
              <p
                className={`mt-3 rounded-xl px-4 py-3 text-sm ${
                  traceFound
                    ? "border border-fm-green/25 bg-fm-green-soft text-fm-ink"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
                role="status"
              >
                {traceMessage}
              </p>
            )}
          </section>

          <section className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-neu">
            <h2 className="font-display text-lg font-semibold text-fm-ink">Materials</h2>
            {draft ? (
              <form onSubmit={saveMaterials} className="mt-3 space-y-3">
                <div>
                  <label htmlFor="material-yarn" className="block text-sm font-medium text-fm-ink">
                    Yarn
                  </label>
                  <input
                    id="material-yarn"
                    value={draft.yarn}
                    onChange={(event) => setDraft({ ...draft, yarn: event.target.value })}
                    className="mt-1 min-h-[48px] w-full rounded-xl border-2 border-slate-200 px-4 text-base text-fm-ink focus:border-fm-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="material-yarn-source"
                    className="block text-sm font-medium text-fm-ink"
                  >
                    Yarn source
                  </label>
                  <input
                    id="material-yarn-source"
                    value={draft.yarnSource}
                    onChange={(event) => setDraft({ ...draft, yarnSource: event.target.value })}
                    className="mt-1 min-h-[48px] w-full rounded-xl border-2 border-slate-200 px-4 text-base text-fm-ink focus:border-fm-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="material-dye" className="block text-sm font-medium text-fm-ink">
                    Dye
                  </label>
                  <input
                    id="material-dye"
                    value={draft.dye}
                    onChange={(event) => setDraft({ ...draft, dye: event.target.value })}
                    className="mt-1 min-h-[48px] w-full rounded-xl border-2 border-slate-200 px-4 text-base text-fm-ink focus:border-fm-blue focus:outline-none"
                  />
                </div>
                <button type="submit" className="btn-primary min-h-[48px] w-full font-semibold">
                  Save
                </button>
              </form>
            ) : (
              <>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="text-sm text-fm-muted">Yarn</dt>
                    <dd className="text-fm-ink">{materials.yarn}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-fm-muted">Yarn source</dt>
                    <dd className="text-fm-ink">{materials.yarnSource}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-fm-muted">Dye</dt>
                    <dd className="text-fm-ink">{materials.dye}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => setDraft({ ...materials })}
                  className="btn-outline mt-4 min-h-[48px] w-full font-semibold"
                >
                  Edit
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {screen === "passport" && selected && (
        <div>
          <label htmlFor="pooled-piece" className="block text-sm font-medium text-fm-ink">
            Piece
          </label>
          <select
            id="pooled-piece"
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 min-h-[48px] w-full rounded-xl border-2 border-slate-200 bg-white px-4 text-base text-fm-ink focus:border-fm-blue focus:outline-none"
          >
            {POOLED_PIECES.map((piece) => (
              <option key={piece.id} value={piece.id}>
                {piece.id}
              </option>
            ))}
          </select>
          <div className="mt-4">
            <PassportPanel
              clusterId="kutch"
              heritageName="Kutch"
              heritageCraft="Bhujodi handloom weaving"
              pieceLine={pieceSummary(selected)}
              technicalExtra={technicalFor(selected, materials)}
              pooled
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {openPiece ? (
          <PieceSheet
            key={openPiece.id}
            piece={openPiece}
            onClose={closeSheet}
            onOpenPassport={() => openPassport(openPiece.id)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PieceSheet({
  piece,
  onClose,
  onOpenPassport,
}: {
  piece: PooledPiece;
  onClose: () => void;
  onOpenPassport: () => void;
}) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const maker = resolveMaker(piece.makerId);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const unlock = lockAppScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlock();
    };
  }, [onClose]);

  return (
    <PhoneOverlay>
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.button
        type="button"
        className="absolute inset-0 bg-fm-ink/40"
        aria-label="Close piece details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
        className="relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-2xl font-semibold text-fm-ink">
            {piece.id}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl text-fm-muted hover:bg-fm-surface hover:text-fm-ink"
            aria-label="Close"
          >
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          </button>
        </div>
        <dl className="mt-4 space-y-3 text-base">
          <div>
            <dt className="text-sm text-fm-muted">Maker</dt>
            <dd className="text-fm-ink">
              {maker.name}, {maker.village}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-fm-muted">Artisan ID</dt>
            <dd className="text-fm-ink">{maker.id}</dd>
          </div>
          <div>
            <dt className="text-sm text-fm-muted">Woven date</dt>
            <dd className="text-fm-ink">{piece.wovenDate}</dd>
          </div>
          <div>
            <dt className="text-sm text-fm-muted">Carton</dt>
            <dd className="text-fm-ink">Carton {piece.carton}</dd>
          </div>
        </dl>
        <p className="mt-4 text-fm-ink">Recorded by {STEWARD.name}</p>
        <button
          type="button"
          onClick={onOpenPassport}
          className="btn-primary mt-5 flex min-h-[52px] w-full items-center justify-center text-lg font-semibold"
        >
          Open this piece&apos;s passport
        </button>
      </motion.div>
    </div>
    </PhoneOverlay>
  );
}
