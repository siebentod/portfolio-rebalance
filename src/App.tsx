import { useState, useEffect } from 'react';
import AssetForm from './components/asset-form';
import PortfolioTable from './components/portfolio-table';
import RebalanceOperations from './components/operations';
import toast, { Toaster } from 'react-hot-toast';
import SumAndSumToAdd from './components/sum-and-sum-to-add';
import TopRightWindow from './components/top-right-window';
import { type Asset, type SavedPortfolio } from './types';
import Header from './components/header';

interface RebalanceOperation {
  assetName: string;
  action: 'buy' | 'sell';
  quantity: number;
  value: number;
}

export default function PortfolioRebalancer() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState({
    name: '',
    price: '',
    quantity: '',
    targetPercentage: '',
  });
  const [sumAdjustment, setSumAdjustment] = useState(0);
  const [savedPortfolio, setSavedPortfolio] = useState<SavedPortfolio | null>(
    null
  );
  const [showLoadBox, setShowLoadBox] = useState(false);
  const [savedDataNotChanged, setSavedDataNotChanged] = useState(false);
  const [dontShowSaveButton, setDontShowSaveButton] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('portfolioAssets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedPortfolio(parsed);
        setShowLoadBox(true);
      } catch (e) {
        console.error('Error parsing saved portfolio:', e);
      }
    }
  }, []);

  const loadFromLocalStorage = () => {
    console.log('savedPortfolio', savedPortfolio);
    if (savedPortfolio) {
      const { assets } = savedPortfolio;
      setAssets(assets);
      setShowLoadBox(false);
      toast.success('Портфель загружен');
      setSavedDataNotChanged(true);
    }
  };

  const addAsset = () => {
    if (
      !newAsset.name.trim() ||
      newAsset.price.trim() === '' ||
      newAsset.quantity.trim() === '' ||
      newAsset.targetPercentage.trim() === '' ||
      isNaN(Number(newAsset.price)) ||
      isNaN(Number(newAsset.quantity)) ||
      isNaN(Number(newAsset.targetPercentage))
    ) {
      toast.error('Заполните все поля корректными числовыми значениями');
      return;
    }

    const price = Number.parseFloat(newAsset.price);
    const quantity = Number.parseFloat(newAsset.quantity);
    const targetPercentage = Number.parseFloat(newAsset.targetPercentage);

    if (
      price <= 0 ||
      quantity <= 0 ||
      targetPercentage < 0 ||
      targetPercentage > 100
    ) {
      toast.error('Заполните все поля корректными числовыми значениями');
      return;
    }

    const asset: Asset = {
      id: Date.now().toString(),
      name: newAsset.name.trim(),
      price,
      quantity,
      targetPercentage,
    };

    setAssets([...assets, asset]);
    setNewAsset({ name: '', price: '', quantity: '', targetPercentage: '' });
    setSavedDataNotChanged(false);
  };

  const setSumAdjustmentValue = (sum: number) => {
    setSumAdjustment(sum);
    setSavedDataNotChanged(false);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter((asset) => asset.id !== id));
    setSavedDataNotChanged(false);
  };

  const updateAsset = (
    id: string,
    field: keyof Asset,
    value: string | number
  ) => {
    let newValue: string | number = value;

    if (field === 'name') {
      // Валидация названия актива
      const trimmedName = String(value).trim();
      if (!trimmedName) {
        toast.error('Название актива не может быть пустым');
        return;
      }

      // Проверка уникальности названий (без учета регистра)
      const isDuplicate = assets.some(asset =>
        asset.id !== id && asset.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (isDuplicate) {
        toast.error('Актив с таким названием уже существует');
        return;
      }

      newValue = trimmedName;
    } else if (
      field === 'quantity' ||
      field === 'targetPercentage' ||
      field === 'price'
    ) {
      if (typeof value === 'string') {
        if (value.endsWith('.')) {
          newValue = value;
          console.log('newValue', newValue);
        } else {
          newValue = Number.parseFloat(value) || 0;
        }
      } else {
        newValue = value;
      }
    }

    setAssets(
      assets.map((asset) =>
        asset.id === id ? { ...asset, [field]: newValue } : asset
      )
    );
    setSavedDataNotChanged(false);
  };

  const calculateRebalance = (): RebalanceOperation[] => {
    if (assets.length === 0) return [];

    const currentTotalValue = assets.reduce(
      (sum, asset) => sum + asset.price * asset.quantity,
      0
    );

    const newTotalValue = currentTotalValue + sumAdjustment;

    const totalTargetPercentage = assets.reduce(
      (sum, asset) => sum + asset.targetPercentage,
      0
    );

    if (Math.abs(totalTargetPercentage - 100) > 0.01) {
      return [];
    }

    const operations: RebalanceOperation[] = [];

    assets.forEach((asset) => {
      const currentValue = asset.price * asset.quantity;
      const targetValue = (newTotalValue * asset.targetPercentage) / 100;
      const difference = targetValue - currentValue;

      if (Math.abs(difference) > 0.01) {
        const quantityDifference = difference / asset.price;

        operations.push({
          assetName: asset.name,
          action: difference > 0 ? 'buy' : 'sell',
          quantity: Math.abs(quantityDifference),
          value: Math.abs(difference),
        });
      }
    });

    return operations.sort((a, b) => b.action.localeCompare(a.action));
  };

  const calculateRebalancedAssets = (): Asset[] => {
    const operations = calculateRebalance();
    const rebalancedAssets = assets.map((asset) => ({ ...asset }));

    operations.forEach((operation) => {
      const asset = rebalancedAssets.find(
        (a) => a.name === operation.assetName
      );
      if (asset) {
        if (operation.action === 'buy') {
          asset.quantity += operation.quantity;
        } else {
          asset.quantity -= operation.quantity;
        }
      }
    });

    return rebalancedAssets;
  };

  const saveToLocalStorage = () => {
    const rebalancedAssets = calculateRebalancedAssets();
    localStorage.setItem(
      'portfolioAssets',
      JSON.stringify({ date: Date.now(), assets: [...rebalancedAssets] })
    );
    toast.success('Ребалансированный портфель сохранен в браузере');
    setSavedDataNotChanged(true);
  };

  const operations = calculateRebalance();
  const totalValue = assets.reduce(
    (sum, asset) => sum + asset.price * asset.quantity,
    0
  );
  const totalTargetPercentage = assets.reduce(
    (sum, asset) => sum + asset.targetPercentage,
    0
  );

  const showSaveButton =
    !savedDataNotChanged &&
    !dontShowSaveButton &&
    Math.abs(totalTargetPercentage - 100) < 0.01;

  return (
    <>
      <div className='min-h-screen bg-background text-foreground p-6 pb-3'>
        <div className='max-w-2xl mx-auto'>
          <Header />

          <AssetForm
            newAsset={newAsset}
            setNewAsset={setNewAsset}
            onAddAsset={addAsset}
            onSetSumAdjustment={setSumAdjustmentValue}
            sumAdjustment={sumAdjustment}
            hasAssets={assets.length > 0}
          />

          {sumAdjustment !== 0 && (
            <SumAndSumToAdd
              sumAdjustment={sumAdjustment}
              setSumAdjustment={setSumAdjustment}
              totalValue={totalValue}
            />
          )}

          <PortfolioTable
            assets={assets}
            totalValue={totalValue}
            onUpdateAsset={updateAsset}
            onRemoveAsset={removeAsset}
          />

          <RebalanceOperations
            operations={operations}
            hasAssets={assets.length > 0}
            totalTargetPercentage={totalTargetPercentage}
          />
        </div>
      </div>

      <TopRightWindow
        showSaveButton={showSaveButton}
        showLoadBox={showLoadBox}
        savedPortfolio={savedPortfolio}
        saveToLocalStorage={saveToLocalStorage}
        loadFromLocalStorage={loadFromLocalStorage}
        setDontShowSaveButton={setDontShowSaveButton}
        setShowLoadBox={setShowLoadBox}
      />

      <Toaster
        position='top-center'
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            maxWidth: '500px',
            padding: '4px 8px',
            backgroundColor: '#005AE1',
            color: 'white',
          },
        }}
      />
    </>
  );
}
