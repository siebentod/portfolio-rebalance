import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from './modal';
import toast from 'react-hot-toast';

interface Asset {
  name: string;
  price: string;
  quantity: string;
  targetPercentage: string;
}

interface AssetFormProps {
  newAsset: Asset;
  setNewAsset: (asset: Asset) => void;
  onAddAsset: () => void;
  onAddSum: (sum: number) => void;
  sumToAdd: number;
}

// Схема валидации для основной формы
const assetSchema = z.object({
  name: z.string().min(1, 'Название актива обязательно'),
  targetPercentage: z
    .string()
    .min(1, 'Укажите целевой процент')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: 'Процент должен быть от 0 до 100' }
    ),
  price: z
    .string()
    .min(1, 'Укажите цену актива')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
      },
      { message: 'Цена должна быть больше 0' }
    ),
  quantity: z
    .string()
    .min(1, 'Укажите количество')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num >= 0;
      },
      { message: 'Количество должно быть неотрицательным' }
    ),
});

// Схема валидации для формы добавления суммы
const sumSchema = z.object({
  sum: z
    .string()
    .min(1, 'Укажите сумму')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num > 0;
      },
      { message: 'Сумма должна быть больше 0' }
    ),
});

type AssetFormData = z.infer<typeof assetSchema>;
type SumFormData = z.infer<typeof sumSchema>;

export default function AssetForm({
  newAsset,
  setNewAsset,
  onAddAsset,
  onAddSum,
  sumToAdd,
}: AssetFormProps) {
  const [addSumOpened, setAddSumOpened] = useState(false);

  // Форма для активов
 const {
    control: assetControl,
    handleSubmit: handleAssetSubmit,
    formState: { errors: assetErrors },
    // setValue: setAssetValue,
    reset: resetAssetForm,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: newAsset.name,
      price: newAsset.price,
      quantity: newAsset.quantity,
      targetPercentage: newAsset.targetPercentage,
    },
  });

  // Форма для добавления суммы
  const {
    control: sumControl,
    handleSubmit: handleSumSubmit,
    formState: { errors: sumErrors },
    setValue: setSumValue,
  } = useForm<SumFormData>({
    resolver: zodResolver(sumSchema),
    defaultValues: {
      sum: sumToAdd ? sumToAdd.toString() : '',
    },
  });

  useEffect(() => {
    setSumValue('sum', sumToAdd ? sumToAdd.toString() : '');
  }, [sumToAdd, setSumValue]);

  const handleToggleSumForm = () => {
    setAddSumOpened(!addSumOpened);
  };

  const onAssetFormSubmit = useCallback((data: AssetFormData) => {
    // Нормализуем запятые в точки перед передачей данных
    const normalizedData = {
      name: data.name,
      price: data.price.replace(',', '.'),
      quantity: data.quantity.replace(',', '.'),
      targetPercentage: data.targetPercentage.replace(',', '.'),
    };
    setNewAsset(normalizedData);
    onAddAsset();
    resetAssetForm();
  }, [onAddAsset, resetAssetForm, setNewAsset]);

  const onSumFormSubmit = (data: SumFormData) => {
    const normalizedSum = parseFloat(data.sum.replace(',', '.'));
    setAddSumOpened(false);
    onAddSum(normalizedSum);
  };

  // Функция для фильтрации ввода только цифр, точки и запятой
  const filterNumericInput = (value: string): string => {
    // Разрешаем только цифры, точку и запятую
    let filtered = value.replace(/[^0-9.,]/g, '');

    // Заменяем запятую на точку для внутренней обработки
    filtered = filtered.replace(',', '.');

    // Разрешаем только одну точку
    const parts = filtered.split('.');
    if (parts.length > 2) {
      filtered = parts[0] + '.' + parts.slice(1).join('');
    }

    return filtered;
  };

  useEffect(() => {
    const handleEnterPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !addSumOpened) {
        handleAssetSubmit(onAssetFormSubmit)();
      }
    };
    document.addEventListener('keydown', handleEnterPress);
    return () => {
      document.removeEventListener('keydown', handleEnterPress);
    };
  }, [addSumOpened, handleAssetSubmit, onAssetFormSubmit]);

  return (
    <>
      <div className='bg-card border border-border rounded-lg p-6 mb-8 max-w-3xl'>
        <h2 className='text-xl font-semibold mb-4'>Добавить актив</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
          <div>
            <Controller
              name='name'
              control={assetControl}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='Название актива'
                  className='w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  onChange={(e) => {
                    field.onChange(e);
                    setNewAsset({ ...newAsset, name: e.target.value });
                  }}
                />
              )}
            />
            {assetErrors.name && (
              <p className='text-red-500 text-sm mt-1'>
                {assetErrors.name.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name='targetPercentage'
              control={assetControl}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='Целевой % (0-100)'
                  className='w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  onChange={(e) => {
                    const filtered = filterNumericInput(e.target.value);
                    field.onChange(filtered);
                    setNewAsset({ ...newAsset, targetPercentage: filtered });
                  }}
                />
              )}
            />
            {assetErrors.targetPercentage && (
              <p className='text-red-500 text-sm mt-1'>
                {assetErrors.targetPercentage.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name='price'
              control={assetControl}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='Текущая цена актива'
                  className='w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  onChange={(e) => {
                    const filtered = filterNumericInput(e.target.value);
                    field.onChange(filtered);
                    setNewAsset({ ...newAsset, price: filtered });
                  }}
                />
              )}
            />
            {assetErrors.price && (
              <p className='text-red-500 text-sm mt-1'>
                {assetErrors.price.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              name='quantity'
              control={assetControl}
              render={({ field }) => (
                <input
                  {...field}
                  type='text'
                  placeholder='Текущее количество'
                  className='w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                  onChange={(e) => {
                    const filtered = filterNumericInput(e.target.value);
                    field.onChange(filtered);
                    setNewAsset({ ...newAsset, quantity: filtered });
                  }}
                />
              )}
            />
            {assetErrors.quantity && (
              <p className='text-red-500 text-sm mt-1'>
                {assetErrors.quantity.message}
              </p>
            )}
          </div>
        </div>

        <div className='flex justify-between'>
          <button
            onClick={handleAssetSubmit(onAssetFormSubmit)}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer mr-2'
          >
            Создать
          </button>
          <div className='flex gap-x-2'>
            <button
              onClick={handleToggleSumForm}
              className='px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors cursor-pointer'
            >
              {sumToAdd === 0 ? 'Добавить сумму' : 'Изменить добавленную сумму'}
            </button>
            <button
              onClick={() => toast('Yet to be done...')}
              className='px-4 py-2 bg-secondary text-muted-foreground rounded-md transition-colors cursor-pointer'
            >
              {'Снять сумму'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={addSumOpened}
        onClose={handleToggleSumForm}
        title='Добавить сумму'
        action={handleSumSubmit(onSumFormSubmit)}
      >
        <div>
          <Controller
            name='sum'
            control={sumControl}
            render={({ field }) => (
              <input
                {...field}
                type='text'
                placeholder='Введите сумму'
                className='block mx-auto px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                onChange={(e) => {
                  const filtered = filterNumericInput(e.target.value);
                  field.onChange(filtered);
                }}
              />
            )}
          />
          {sumErrors.sum && (
            <p className='text-red-500 text-sm mt-1 text-center'>
              {sumErrors.sum.message}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
