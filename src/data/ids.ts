import { randomUUID } from 'expo-crypto';

export const newId = () => randomUUID();
export const now = () => new Date().toISOString();
