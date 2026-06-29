import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export async function getGuestToken(): Promise<string> {
  try {
    let token = await AsyncStorage.getItem('guest_token');
    if (!token) {
      token = uuidv4();
      await AsyncStorage.setItem('guest_token', token);
    }
    return token;
  } catch (error) {
    console.error('Error getting guest token:', error);
    return uuidv4(); // Fallback
  }
}

export async function clearGuestToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem('guest_token');
  } catch (error) {
    console.error('Error clearing guest token:', error);
  }
}