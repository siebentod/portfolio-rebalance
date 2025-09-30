import { formatNumber } from '../lib/format-number';

export default function SumAndSumToAdd({
  sumToAdd,
  setSumToAdd,
  totalValue,
}: {
  sumToAdd: number;
  setSumToAdd: (value: number) => void;
  totalValue: number;
}) {
  return (
    <div className='bg-card border border-border rounded-lg p-6 mb-8 flex flex-nowrap'>
      <span>
        <span>Сумма к добавлению:{' '} 
        {formatNumber(sumToAdd)}</span> <span className='text-muted-foreground'>(Новая общая сумма:{' '}
        {formatNumber(Math.round(sumToAdd + totalValue))})</span>
      </span>
      <button
        className='ml-1.5 cursor-pointer text-sm flex items-center'
        onClick={() => setSumToAdd(0)}
      >
        ✕
      </button>
    </div>
  );
}
