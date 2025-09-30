import { useState, useEffect } from 'react';
import AssetForm from './components/asset-form';
import PortfolioTable from './components/portfolio-table';
import RebalanceOperations from './components/rebalance-operations';
import toast, { Toaster } from 'react-hot-toast';
import SumAndSumToAdd from './components/sum-and-sum-to-add';
import Balancer from 'react-wrap-balancer';
import { X } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  price: number;
  quantity: number;
  targetPercentage: number;
}

interface RebalanceOperation {
  assetName: string;
  action: 'buy' | 'sell';
  quantity: number;
  value: number;
}

interface SavedPortfolio {
  date: number;
  assets: Asset[];
}

export default function PortfolioRebalancer() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [newAsset, setNewAsset] = useState({
    name: '',
    price: '',
    quantity: '',
    targetPercentage: '',
  });
  const [sumToAdd, setSumToAdd] = useState(0);
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const addSum = (sum: number) => {
    setSumToAdd(sum);
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
    setAssets(
      assets.map((asset) =>
        asset.id === id ? { ...asset, [field]: value } : asset
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

    const newTotalValue = currentTotalValue + sumToAdd;

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
    toast.success('Портфель сохранен в браузере');
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

  const showSaveButton = !savedDataNotChanged && !dontShowSaveButton &&
    Math.abs(totalTargetPercentage - 100) < 0.01;

  return (
    <>
      <div className='min-h-screen bg-background text-foreground p-6'>
        <div className='max-w-2xl mx-auto'>
          <h1 className='text-2xl font-bold mb-8 text-center leading-6'>
            <Balancer>
              Утилита для ребалансировки инвестиционного портфеля
            </Balancer>
          </h1>
          <AssetForm
            newAsset={newAsset}
            setNewAsset={setNewAsset}
            onAddAsset={addAsset}
            onAddSum={addSum}
            sumToAdd={sumToAdd}
          />
          {sumToAdd > 0 && (
            <SumAndSumToAdd
              sumToAdd={sumToAdd}
              setSumToAdd={setSumToAdd}
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

      {showLoadBox && savedPortfolio && (
        <div className='fixed top-2 right-2 border border-border rounded-lg shadow-sm p-2 bg-background'>
          <div className='flex items-start justify-between gap-2 mb-2'>
            <span className='text-sm text-gray-700'>
              <span className='ml-1'>Сохраненный портфель</span>
            </span>
            <button
              onClick={() => setShowLoadBox(false)}
              className='text-gray-500 hover:text-gray-700 transition-colors'
            >
              <X size={16} />
            </button>
          </div>
          <button
            onClick={loadFromLocalStorage}
            className='px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium transition-colors w-full'
          >
            Загрузить ({formatDate(savedPortfolio.date)})
          </button>
        </div>
      )}

      {showSaveButton && (
        <div
          className='fixed top-2 right-2 border border-border rounded-lg shadow-sm p-1.5 pr-5 bg-background'
          style={{ marginTop: showLoadBox ? '100px' : '0' }}
        >
          <button
            onClick={saveToLocalStorage}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors relative'
          >
            Сохранить в браузере
          </button>
          <button
            onClick={() => setDontShowSaveButton(true)}
            className='text-gray-500 hover:text-gray-700 transition-colors absolute top-[2px] right-[3px]'
          >
            <X size={16} />
          </button>
        </div>
      )}

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
