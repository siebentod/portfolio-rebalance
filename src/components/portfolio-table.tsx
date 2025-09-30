// @ts-expect-error syntax
import ArrowUp from '../assets/arrow-up.svg?react';
import image2 from '/image2.webp';
import { formatNumber } from '../lib/format-number';
// import image from '/image.webp';

interface Asset {
  id: string;
  name: string;
  price: number;
  quantity: number;
  targetPercentage: number;
}

interface PortfolioTableProps {
  assets: Asset[];
  totalValue: number;
  onUpdateAsset: (
    id: string,
    field: keyof Asset,
    value: string | number
  ) => void;
  onRemoveAsset: (id: string) => void;
}

export default function PortfolioTable({
  assets,
  totalValue,
  onUpdateAsset,
  onRemoveAsset,
}: PortfolioTableProps) {
  if (assets.length === 0) {
    return (
      <div className='text-center py-6 text-muted-foreground'>
        <div className='text-6xl mb-4 mx-auto flex justify-center'>
          <img src={image2} className='w-24' />
        </div>
        <h3 className='text-xl mb-2'>Добавьте активы в портфель</h3>
        <p>Начните с добавления ваших инвестиционных активов выше</p>
      </div>
    );
  }

  return (
    <div className='bg-card border border-border rounded-lg p-6 mb-8'>
      <h2 className='text-xl font-semibold mb-4'>Текущий портфель</h2>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border'>
              <th className='py-2 px-1'>Актив</th>
              <th className='py-2 px-1'>Цена</th>
              <th className='py-2 px-1'>Количество</th>
              <th className='py-2 px-1'>Стоимость</th>
              <th className='py-2 px-1 whitespace-nowrap'>Текущий %</th>
              <th className='py-2 px-1 whitespace-nowrap'>Целевой %</th>
              <th className='py-2 px-1'></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const value = asset.price * asset.quantity;
              const currentPercentage =
                totalValue > 0 ? (value / totalValue) * 100 : 0;

              const difference =
                Math.abs(currentPercentage - asset.targetPercentage) > 0.1
                  ? currentPercentage - asset.targetPercentage
                  : 0;

              return (
                <tr key={asset.id} className='border-b border-border'>
                  <td className='py-2 px-1 font-medium text-center'>
                    {asset.name}
                  </td>
                  <td className='py-2 px-1 text-center'>
                    <input
                      type='number'
                      value={asset.price}
                      onChange={(e) =>
                        onUpdateAsset(
                          asset.id,
                          'price',
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-20 px-2 py-1 border border-input rounded bg-background text-sm'
                      step='0.01'
                    />
                  </td>
                  <td className='py-2 px-1 text-center'>
                    <input
                      type='number'
                      value={asset.quantity}
                      onChange={(e) =>
                        onUpdateAsset(
                          asset.id,
                          'quantity',
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-20 px-2 py-1 border border-input rounded bg-background text-sm'
                      step='1'
                    />
                  </td>
                  <td className='py-2 px-1 text-center'>{formatNumber(value)}</td>
                  <td className='py-2 px-1 text-center'>
                    <span
                      className={`flex justify-center items-center ${
                        difference > 0
                          ? 'text-green-600'
                          : difference < 0
                          ? 'text-destructive'
                          : 'text-foreground'
                      }`}
                    >
                      {currentPercentage.toFixed(1)}%{' '}
                      {difference > 0 ? (
                        <ArrowUp className='w-4' />
                      ) : difference < 0 ? (
                        <ArrowUp className='w-4 rotate-180' />
                      ) : null}
                    </span>
                  </td>
                  <td className='py-2 px-1 text-center'>
                    <input
                      type='number'
                      value={asset.targetPercentage}
                      onChange={(e) =>
                        onUpdateAsset(
                          asset.id,
                          'targetPercentage',
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-16 px-2 py-1 border border-input rounded bg-background text-sm'
                      step='1'
                      min='0'
                      max='100'
                    />
                    %
                  </td>
                  <td className='py-2 px-1'>
                    <button
                      onClick={() => onRemoveAsset(asset.id)}
                      className='font-bold text-black text-xs cursor-pointer flex items-center'
                      title='Удалить актив'
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className='mt-4 text-lg font-semibold'>
        Общая стоимость портфеля: {formatNumber(totalValue)}</div>
      <div className='mt-2 text-sm text-muted-foreground'>
        Сумма целевых процентов:{' '}
        {assets
          .reduce((sum, asset) => sum + asset.targetPercentage, 0)
          .toFixed(1)}
        %
      </div>
    </div>
  );
}
