import { Category } from './category';

export interface Shop {
  id: number;
  name: string;
  lat: string;
  lng: string;
  image: string;
  category: Category;
}
