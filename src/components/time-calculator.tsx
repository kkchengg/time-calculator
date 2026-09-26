import { Check, Copy } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { useTranslation } from '@/i18n/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  sanitizeTimeDigits,
  shouldAutoFocusTimeToAfterFrom,
  tryParseDigitField,
} from '@/lib/parse-time-range';
import {
  backwardDiffMinutes,
  formatDecimalHours,
  formatDuration,
  formatTotalMinutes,
  forwardSpanMinutes,
} from '@/lib/time-math';
import { cn } from '@/lib/utils';

type ParseState =
  | { status: 'idle' }
  | { status: 'ok'; data: { leftMinutes: number; rightMinutes: number } }
  | { status: 'error-from'; message: string }
  | { status: 'error-to'; message: string };

type ResultVariant = 'forward' | 'backward';

function getCurrentTimeDigits(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}${m}`;
}

function CopyValueButton({ value }: { value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (resetTimer.current !== undefined) {
        window.clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (resetTimer.current !== undefined) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="shrink-0 text-muted-foreground hover:text-foreground"
      onClick={copy}
      aria-label={t('copy.label', { value })}
    >
      {copied ? (
        <Check className="size-4 text-[hsl(152_55%_38%)]" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  );
}

function ResultRow({
  title,
  description,
  totalMinutes,
  variant,
  hourSuffix,
  minuteSuffix,
}: {
  title: string;
  description: string;
  totalMinutes: number;
  variant: ResultVariant;
  hourSuffix: string;
  minuteSuffix: string;
}) {
  const { t } = useTranslation();
  const duration = formatDuration(totalMinutes);
  const decimal = formatDecimalHours(totalMinutes, 2, hourSuffix);
  const mins = formatTotalMinutes(totalMinutes, minuteSuffix);

  return (
    <div
      className={cn(
        'space-y-2 rounded-xl border-2 p-4 shadow-sm transition-colors',
        variant === 'forward' &&
          'border-[hsl(var(--forward-accent)/0.35)] bg-[hsl(var(--forward-muted))]',
        variant === 'backward' &&
          'border-[hsl(var(--backward-accent)/0.35)] bg-[hsl(var(--backward-muted))]',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            'border-2 font-semibold',
            variant === 'forward' &&
              'border-[hsl(var(--forward-accent)/0.45)] bg-white/70 text-[hsl(var(--forward-accent))]',
            variant === 'backward' &&
              'border-[hsl(var(--backward-accent)/0.45)] bg-white/70 text-[hsl(var(--backward-accent))]',
          )}
        >
          {title}
        </Badge>
      </div>
      <p
        className={cn(
          'text-sm leading-relaxed',
          variant === 'forward' && 'text-[hsl(222_18%_38%)]',
          variant === 'backward' && 'text-[hsl(330_16%_38%)]',
        )}
      >
        {description}
      </p>
      <dl className="grid gap-3 sm:grid-cols-1">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white/85 px-3 py-2 font-mono text-sm shadow-sm">
          <div>
            <dt className="text-xs font-sans text-muted-foreground">
              {t('result.duration')}
            </dt>
            <dd className="text-base font-semibold tracking-tight">{duration}</dd>
          </div>
          <CopyValueButton value={duration} />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white/85 px-3 py-2 font-mono text-sm shadow-sm">
          <div>
            <dt className="text-xs font-sans text-muted-foreground">
              {t('result.decimalHours')}
            </dt>
            <dd className="text-base font-semibold tracking-tight">{decimal}</dd>
          </div>
          <CopyValueButton
            value={decimal.replace(hourSuffix, '').trim()}
          />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white/85 px-3 py-2 font-mono text-sm shadow-sm">
          <div>
            <dt className="text-xs font-sans text-muted-foreground">
              {t('result.totalMinutes')}
            </dt>
            <dd className="text-base font-semibold tracking-tight">{mins}</dd>
          </div>
          <CopyValueButton value={String(Math.round(totalMinutes))} />
        </div>
      </dl>
    </div>
  );
}

export function TimeCalculator() {
  const { t } = useTranslation();
  const hourSuffix = t('units.hourSuffix');
  const minuteSuffix = t('units.minuteSuffix');

  const id = useId();
  const fromId = `${id}-from`;
  const toId = `${id}-to`;
  const errorId = `${id}-error`;

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const [fromDigits, setFromDigits] = useState(() => getCurrentTimeDigits());
  const [toDigits, setToDigits] = useState('');

  useEffect(() => {
    const raf = requestAnimationFrame(() => fromRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const fromField = useMemo(() => tryParseDigitField(fromDigits), [fromDigits]);
  const toField = useMemo(() => tryParseDigitField(toDigits), [toDigits]);

  const parsed: ParseState = useMemo(() => {
    if (fromField.status === 'error') {
      return { status: 'error-from', message: fromField.error.message };
    }
    if (toField.status === 'error') {
      return { status: 'error-to', message: toField.error.message };
    }
    if (fromField.status !== 'ok' || toField.status !== 'ok') {
      return { status: 'idle' };
    }
    return {
      status: 'ok',
      data: {
        leftMinutes: fromField.minutes,
        rightMinutes: toField.minutes,
      },
    };
  }, [fromField, toField]);

  const results =
    parsed.status === 'ok'
      ? {
          forward: forwardSpanMinutes(
            parsed.data.leftMinutes,
            parsed.data.rightMinutes,
          ),
          backward: backwardDiffMinutes(
            parsed.data.leftMinutes,
            parsed.data.rightMinutes,
          ),
        }
      : null;

  const showFromError = parsed.status === 'error-from';
  const showToError = parsed.status === 'error-to';
  const errorMessage =
    parsed.status === 'error-from' || parsed.status === 'error-to'
      ? parsed.message
      : '';

  const onFromChange = (raw: string) => {
    const next = sanitizeTimeDigits(raw);
    const auto = shouldAutoFocusTimeToAfterFrom(next);
    setFromDigits(next);
    if (auto) {
      queueMicrotask(() => toRef.current?.focus());
    }
  };

  const onFromKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' && e.key !== 'ArrowRight') {
      return;
    }
    const r = tryParseDigitField(fromDigits);
    const shouldMove =
      r.status === 'ok' || (fromDigits.length === 0 && e.key === 'ArrowRight');
    if (shouldMove) {
      e.preventDefault();
      toRef.current?.focus();
    }
  };

  const onToChange = (raw: string) => {
    const next = sanitizeTimeDigits(raw);
    setToDigits(next);
    if (toDigits.length === 1 && next.length === 0) {
      queueMicrotask(() => fromRef.current?.focus());
    }
  };

  return (
    <Card className="w-full max-w-lg border-border/70 bg-card/95 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
              {t('app.title')}
            </CardTitle>
            <CardDescription className="text-[15px] leading-snug">
              {t('app.description')}
            </CardDescription>
          </div>
          <LanguageSwitcher />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <fieldset className="space-y-3">
          <legend className="mb-1 text-sm font-medium leading-none">
            {t('calculation.legend')}
          </legend>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor={fromId} className="sr-only">
                {t('calculation.from')}
              </label>
              <Input
                id={fromId}
                ref={fromRef}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder={t('calculation.placeholderFrom')}
                value={fromDigits}
                onChange={(e) => onFromChange(e.target.value)}
                onKeyDown={onFromKeyDown}
                aria-invalid={showFromError}
                aria-describedby={showFromError ? errorId : undefined}
                className={cn(
                  'border-input bg-white/90 text-center font-mono text-lg tracking-widest tabular-nums',
                  showFromError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </div>
            <span
              className="flex h-10 shrink-0 select-none items-center px-1 font-mono text-xl font-light text-muted-foreground"
              aria-hidden
            >
              -
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor={toId} className="sr-only">
                {t('calculation.to')}
              </label>
              <Input
                id={toId}
                ref={toRef}
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder={t('calculation.placeholderTo')}
                value={toDigits}
                onChange={(e) => onToChange(e.target.value)}
                aria-invalid={showToError}
                aria-describedby={showToError ? errorId : undefined}
                className={cn(
                  'border-input bg-white/90 text-center font-mono text-lg tracking-widest tabular-nums',
                  showToError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
            </div>
          </div>
          {(showFromError || showToError) && (
            <p id={errorId} className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          )}
          {!showFromError && !showToError && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-[hsl(var(--forward-accent))]">
                {t('forward.title')}
              </span>
              {t('hint.forwardExample')}{' '}
              <span className="font-medium text-[hsl(var(--backward-accent))]">
                {t('backward.title')}
              </span>
              {t('hint.backwardExample')}
            </p>
          )}
        </fieldset>

        {results && (
          <div className="space-y-4">
            <ResultRow
              variant="forward"
              title={t('forward.title')}
              description={t('forward.description')}
              totalMinutes={results.forward}
              hourSuffix={hourSuffix}
              minuteSuffix={minuteSuffix}
            />
            <ResultRow
              variant="backward"
              title={t('backward.title')}
              description={t('backward.description')}
              totalMinutes={results.backward}
              hourSuffix={hourSuffix}
              minuteSuffix={minuteSuffix}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
