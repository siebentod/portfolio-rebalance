export interface Asset {
  id: string;
  name: string;
  price: number | string;
  quantity: number | string;
  targetPercentage: number | string;
}

export interface SavedPortfolio {
  date: number;
  assets: Asset[];
}
