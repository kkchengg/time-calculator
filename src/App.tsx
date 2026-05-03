import { TimeCalculator } from '@/components/time-calculator';

export default function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-[hsl(210_45%_97%)] via-[hsl(192_35%_96%)] to-[hsl(280_25%_97%)] px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8">
        <TimeCalculator />
      </div>
    </div>
  );
}
