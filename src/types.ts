export interface Asset {
  id: string;
  name: string;
  price: number;
  quantity: number;
  targetPercentage: number;
}

export interface SavedPortfolio {
  date: number;
  assets: Asset[];
}
