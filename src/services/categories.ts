import { api } from 'boot/axios';
import { Category } from 'src/types/category';

const apiUrl =
  import.meta.env.VITE_API_URL || 'https://apidolar.atcode.dev/api/';

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await api.get(`${apiUrl}/categories`);

    return data.data.data as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
