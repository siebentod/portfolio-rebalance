import { type Asset } from '../types';

// Вспомогательные функции для безопасного получения числовых значений
export const getNumericPrice = (asset: Asset): number => 
  typeof asset.price === 'string' ? parseFloat(asset.price) || 0 : asset.price;

export const getNumericQuantity = (asset: Asset): number => 
  typeof asset.quantity === 'string' ? parseFloat(asset.quantity) || 0 : asset.quantity;

export const getNumericTargetPercentage = (asset: Asset): number => 
  typeof asset.targetPercentage === 'string' ? parseFloat(asset.targetPercentage) || 0 : asset.targetPercentage;
