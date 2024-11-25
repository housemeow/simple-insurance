import type { Policyholder } from '@/types';
import axios from 'axios'

const {
  VITE_API_URL,
} = import.meta.env

export const getPolicyholders = (code: string) => axios.get<Policyholder>(`${VITE_API_URL}/api/policyholders`, { params: { code } })
  .then(response => response.data)
  .catch(error => {
    console.error('There was an error fetching the policyholders!', error);
    throw error;
  });

export const getPolicyholdersTop = (code: string) => axios.get<Policyholder>(`${VITE_API_URL}/api/policyholders/${code}/top`)
  .then(response => response.data)
  .catch(error => {
    console.error('There was an error fetching the policyholders!', error);
    throw error;
  });
