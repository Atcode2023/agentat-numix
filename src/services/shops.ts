import { api } from 'boot/axios';
import { Shop } from 'src/types/shop';

const apiUrl =
  import.meta.env.VITE_API_URL || 'https://apidolar.atcode.dev/api/';
export const getShops = async (categoryId: number | null): Promise<Shop[]> => {
  try {
    console.log('Fetching shops with categoryId:', categoryId);
    const { data } = await api.get(
      `${apiUrl}/shops?category_id=${categoryId || ''}`
    );

    return data.data.data as Shop[];
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw error;
  }
};
