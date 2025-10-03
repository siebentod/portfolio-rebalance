import { formatNumber } from '../lib/format-number';
import LinksIcons from './links-icons';

interface RebalanceOperation {
  assetName: string;
  action: 'buy' | 'sell';
  quantity: number;
  value: number;
}

interface RebalanceOperationsProps {
  operations: RebalanceOperation[];
  hasAssets: boolean;
  totalTargetPercentage: number;
}

export default function RebalanceOperations({
  operations,
  hasAssets,
  totalTargetPercentage,
}: RebalanceOperationsProps) {
  if (!hasAssets) return null;

  return (
    <>
      <div className='bg-card border border-border rounded-lg p-6'>
        <h2 className='text-xl font-semibold mb-4'>
          Операции для ребалансировки
        </h2>

        {Math.abs(totalTargetPercentage - 100) > 0.01 ? (
          <div className='text-center py-8 text-yellow-600'>
            <div className='text-4xl mb-2'>⚠️</div>
            <p>Сумма целевых процентов должна равняться 100%</p>
            <p className='text-sm mt-1'>
              Текущая сумма: {totalTargetPercentage.toFixed(1)}%
            </p>
          </div>
        ) : operations.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <div className='text-4xl mb-2'>✅</div>
            <p>Портфель уже сбалансирован согласно целевым пропорциям</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {operations.map((operation, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  operation.action === 'buy'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className='flex justify-between items-center gap-x-[1px]'>
                  <div>
                    <span className='font-medium'>
                      {operation.action === 'buy' ? '📈 Купить' : '📉 Продать'}{' '}
                      {operation.assetName}
                    </span>
                  </div>
                  <div className='text-right'>
                    <div className='font-semibold'>
                      {formatNumber(operation.quantity)} единиц
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      на сумму {formatNumber(operation.value)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LinksIcons />
    </>
  );
}
