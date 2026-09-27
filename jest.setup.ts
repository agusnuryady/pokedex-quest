import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// In-memory AsyncStorage so persisted stores work in tests.
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
