// Save data with timer (expires in 10 minutes)
export function setData<T>(key: string, value: T, ttlMs: number): void {
  const now = Date.now();
  const item = {
    value,
    expiry: now + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// Get data and auto-remove if expired
export function getData<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key);
  console.log(key)
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = Date.now();

  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}

export function removeData(key: string) {
  console.log(key)
  localStorage.removeItem(key);
}
