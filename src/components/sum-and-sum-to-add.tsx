import { formatNumber } from '../lib/format-number';

export default function SumAndSumToAdd({
  sumAdjustment,
  setSumAdjustment,
  totalValue,
}: {
  sumAdjustment: number;
  setSumAdjustment: (value: number) => void;
  totalValue: number;
}) {
  const isAddition = sumAdjustment > 0;
  const actionText = isAddition ? 'добавлению' : 'снятию';

  return (
    <div className='bg-card border border-border rounded-lg p-6 mb-8 flex flex-nowrap'>
      <span>
        <span>Сумма к {actionText}:{' '}
        {formatNumber(Math.abs(sumAdjustment))}</span> <span className='text-muted-foreground'>(Новая общая сумма:{' '}
        {formatNumber(Math.round(sumAdjustment + totalValue))})</span>
      </span>
      <button
        className='ml-1.5 cursor-pointer text-sm flex items-center'
        onClick={() => setSumAdjustment(0)}
      >
        ✕
      </button>
    </div>
  );
}
