import { api } from 'boot/axios';
import { handleMessages } from './notify';

export const getDolar = async () => {
  try {
    const { data } = await api.get(
      'https://apidolar.atcode.dev/api/dolar/today'
    );
    const dolar = data.bcv || {};
    localStorage.setItem('dolar', JSON.stringify(dolar));
    const defaultRate = localStorage.getItem('defaultRate') || 'Tasa BCV';
    return {
      dolar,
      defaultRate,
    };
  } catch (error) {
    const dolar = parseFloat(localStorage.getItem('dolar') || '1');
    const defaultRate = localStorage.getItem('defaultRate') || 'Tasa BCV';

    if (dolar) {
      return {
        dolar,
        defaultRate,
      };
    }

    handleMessages({
      message: 'Oops, Algo no salió bien, recarga',
      color: 'negative',
      icon: 'cancel',
    });
    throw error;
  }
};

export const getHistorial = async (from, to, perPage = 999) => {
  try {
    const params = { per_page: perPage };
    if (from) params.from = from; // formato esperado: YYYY-MM-DD
    if (to) params.to = to;
    const data = await api.get('https://apidolar.atcode.dev/api/prices', {
      params,
    });
    return data.data;
  } catch (error) {
    handleMessages({
      message: 'Oops, Algo no salió bien, recarga',
      color: 'negative',
      icon: 'cancel',
    });
    throw error;
  }
};
