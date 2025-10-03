import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fromTop } from '../lib/motion';
import { type SavedPortfolio } from '../types';

export default function TopRightWindow({
  showSaveButton,
  showLoadBox,
  savedPortfolio,
  saveToLocalStorage,
  loadFromLocalStorage,
  setDontShowSaveButton,
  setShowLoadBox,
}: {
  showSaveButton: boolean;
  showLoadBox: boolean;
  savedPortfolio: SavedPortfolio | null;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  setDontShowSaveButton: (value: boolean) => void;
  setShowLoadBox: (value: boolean) => void;
}) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <AnimatePresence>
      <motion.div {...fromTop} className='fixed top-2 right-2 z-10'>
        {showLoadBox && savedPortfolio && (
          <div className='border border-border rounded-lg shadow-xs p-2 bg-background'>
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
            className='border border-border rounded-lg shadow-xs p-1.5 pr-5 bg-background'
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
      </motion.div>
    </AnimatePresence>
  );
}
