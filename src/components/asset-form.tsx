import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from './modal';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants, buttonVariants } from '../lib/motion';
import { filterNumericInput } from '../lib/format-number';

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
  onSetSumAdjustment: (sum: number) => void;
  sumAdjustment: number;
  hasAssets: boolean;
}

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

const sumSchema = z.object({
  sum: z
    .string()
    .min(1, 'Укажите сумму')
    .refine(
      (val) => {
        const num = parseFloat(val.replace(',', '.'));
        return !isNaN(num) && num !== 0;
      },
      { message: 'Сумма должна быть не равна 0' }
    ),
});

type AssetFormData = z.infer<typeof assetSchema>;
type SumFormData = z.infer<typeof sumSchema>;

export default function AssetForm({
  newAsset,
  setNewAsset,
  onAddAsset,
  onSetSumAdjustment,
  sumAdjustment,
  hasAssets,
}: AssetFormProps) {
  const [addSumOpened, setAddSumOpened] = useState(false);
  const [withdrawSumOpened, setWithdrawSumOpened] = useState(false);

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

  const {
    control: sumControl,
    handleSubmit: handleSumSubmit,
    formState: { errors: sumErrors },
    setValue: setSumValue,
  } = useForm<SumFormData>({
    resolver: zodResolver(sumSchema),
    defaultValues: {
      sum: sumAdjustment > 0 ? sumAdjustment.toString() : '',
    },
  });

  const {
    control: withdrawControl,
    handleSubmit: handleWithdrawSubmit,
    formState: { errors: withdrawErrors },
  } = useForm<SumFormData>({
    resolver: zodResolver(sumSchema),
    defaultValues: {
      sum: '',
    },
  });

  useEffect(() => {
    setSumValue('sum', sumAdjustment > 0 ? sumAdjustment.toString() : '');
  }, [sumAdjustment, setSumValue]);

  const handleToggleSumForm = () => {
    setAddSumOpened(!addSumOpened);
  };

  const handleToggleWithdrawForm = () => {
    setWithdrawSumOpened(!withdrawSumOpened);
  };

  const onAssetFormSubmit = useCallback(
    (data: AssetFormData) => {
      const normalizedData = {
        name: data.name,
        price: data.price.replace(',', '.'),
        quantity: data.quantity.replace(',', '.'),
        targetPercentage: data.targetPercentage.replace(',', '.'),
      };
      setNewAsset(normalizedData);
      onAddAsset();
      resetAssetForm();
    },
    [onAddAsset, resetAssetForm, setNewAsset]
  );

  const onSumFormSubmit = (data: SumFormData) => {
    const normalizedSum = parseFloat(data.sum.replace(',', '.'));
    setAddSumOpened(false);
    onSetSumAdjustment(normalizedSum);
  };

  const onWithdrawFormSubmit = (data: SumFormData) => {
    const normalizedSum = -Math.abs(parseFloat(data.sum.replace(',', '.'))); // Всегда отрицательное
    setWithdrawSumOpened(false);
    onSetSumAdjustment(normalizedSum);
  };

  useEffect(() => {
    const handleEnterPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !addSumOpened && !withdrawSumOpened) {
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
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='bg-card border border-border rounded-lg p-6 mb-8 max-w-3xl'
      >
        <motion.h2
          variants={itemVariants}
          className='text-xl font-semibold mb-4'
        >
          Добавить актив
        </motion.h2>

        <motion.div
          variants={itemVariants}
          className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'
        >
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
        </motion.div>

        <motion.div variants={itemVariants} className='flex justify-between'>
          <motion.button
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
            onClick={handleAssetSubmit(onAssetFormSubmit)}
            className='leading-tight px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer mr-2'
          >
            Создать
          </motion.button>
          {hasAssets && sumAdjustment === 0 && (
            <div className='flex gap-x-2'>
              <motion.button
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
                onClick={handleToggleSumForm}
                className='leading-tight px-4 py-2 bg-secondary text-secondary-foreground/90 rounded-md hover:bg-muted transition-colors cursor-pointer'
              >
                {sumAdjustment === 0
                  ? 'Добавить сумму'
                  : sumAdjustment > 0
                  ? 'Изменить добавленную сумму'
                  : 'Изменить снятую сумму'}
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
                onClick={handleToggleWithdrawForm}
                className='leading-tight px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-muted transition-colors cursor-pointer'
              >
                {'Снять сумму'}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>

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

      <Modal
        isOpen={withdrawSumOpened}
        onClose={handleToggleWithdrawForm}
        title='Снять сумму'
        action={handleWithdrawSubmit(onWithdrawFormSubmit)}
      >
        <div>
          <Controller
            name='sum'
            control={withdrawControl}
            render={({ field }) => (
              <input
                {...field}
                type='text'
                placeholder='Введите сумму для снятия'
                className='block mx-auto px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                onChange={(e) => {
                  const filtered = filterNumericInput(e.target.value);
                  field.onChange(filtered);
                }}
              />
            )}
          />
          {withdrawErrors.sum && (
            <p className='text-red-500 text-sm mt-1 text-center'>
              {withdrawErrors.sum.message}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
