/**
 * IndexedDB-based offline storage for missions, places, and user progress
 */

const DB_NAME = 'traveltactix_offline';
const DB_VERSION = 1;

interface OfflineStore {
  missions: IDBObjectStore;
  places: IDBObjectStore;
  userProgress: IDBObjectStore;
  cachedData: IDBObjectStore;
}

let dbInstance: IDBDatabase | null = null;

export const initOfflineDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Missions store
      if (!db.objectStoreNames.contains('missions')) {
        const missionsStore = db.createObjectStore('missions', { keyPath: 'id' });
        missionsStore.createIndex('city', 'city', { unique: false });
        missionsStore.createIndex('country', 'country', { unique: false });
        missionsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // Places store
      if (!db.objectStoreNames.contains('places')) {
        const placesStore = db.createObjectStore('places', { keyPath: 'id' });
        placesStore.createIndex('city', 'city', { unique: false });
        placesStore.createIndex('category', 'category', { unique: false });
      }

      // User progress store
      if (!db.objectStoreNames.contains('userProgress')) {
        const progressStore = db.createObjectStore('userProgress', { keyPath: 'id' });
        progressStore.createIndex('missionId', 'missionId', { unique: false });
        progressStore.createIndex('userId', 'userId', { unique: false });
      }

      // Generic cached data store
      if (!db.objectStoreNames.contains('cachedData')) {
        const cacheStore = db.createObjectStore('cachedData', { keyPath: 'key' });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
};

export const getDB = async (): Promise<IDBDatabase> => {
  if (dbInstance) return dbInstance;
  return initOfflineDB();
};

// Generic CRUD operations
export const saveToStore = async <T extends { id: string }>(
  storeName: string,
  data: T | T[]
): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  const items = Array.isArray(data) ? data : [data];
  
  for (const item of items) {
    store.put({ ...item, updatedAt: Date.now() });
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getFromStore = async <T>(
  storeName: string,
  key: string
): Promise<T | undefined> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.get(key);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const getByIndex = async <T>(
  storeName: string,
  indexName: string,
  value: string
): Promise<T[]> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readonly');
  const store = transaction.objectStore(storeName);
  const index = store.index(indexName);
  const request = index.getAll(value);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

export const deleteFromStore = async (
  storeName: string,
  key: string
): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.delete(key);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const clearStore = async (storeName: string): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Cache with expiration
export const setCache = async (
  key: string,
  data: any,
  expiresInMs: number = 1000 * 60 * 60 // 1 hour default
): Promise<void> => {
  await saveToStore('cachedData', {
    id: key,
    key,
    data,
    expiresAt: Date.now() + expiresInMs,
    createdAt: Date.now(),
  });
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  const cached = await getFromStore<{ data: T; expiresAt: number }>('cachedData', key);
  if (!cached) return null;
  
  if (cached.expiresAt < Date.now()) {
    await deleteFromStore('cachedData', key);
    return null;
  }
  
  return cached.data;
};

// Specific data operations
export const cacheMissions = async (missions: any[], city: string, country: string) => {
  const key = `missions_${city}_${country}`;
  await setCache(key, missions, 1000 * 60 * 60 * 24); // Cache for 24 hours
  await saveToStore('missions', missions);
};

export const getCachedMissions = async (city: string, country: string) => {
  const key = `missions_${city}_${country}`;
  return getCache<any[]>(key);
};

export const cachePlaces = async (places: any[], city: string) => {
  const key = `places_${city}`;
  await setCache(key, places, 1000 * 60 * 60 * 24);
  await saveToStore('places', places);
};

export const getCachedPlaces = async (city: string) => {
  const key = `places_${city}`;
  return getCache<any[]>(key);
};

export const cacheUserProgress = async (userId: string, progress: any[]) => {
  const key = `progress_${userId}`;
  await setCache(key, progress, 1000 * 60 * 30); // Cache for 30 minutes
  await saveToStore('userProgress', progress);
};

export const getCachedUserProgress = async (userId: string) => {
  const key = `progress_${userId}`;
  return getCache<any[]>(key);
};

// Cleanup expired cache
export const cleanupExpiredCache = async (): Promise<void> => {
  const db = await getDB();
  const transaction = db.transaction('cachedData', 'readwrite');
  const store = transaction.objectStore('cachedData');
  const index = store.index('expiresAt');
  const now = Date.now();
  
  const range = IDBKeyRange.upperBound(now);
  const request = index.openCursor(range);
  
  request.onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
};

// Initialize cleanup on load
if (typeof window !== 'undefined') {
  initOfflineDB().then(() => {
    cleanupExpiredCache();
  });
}
