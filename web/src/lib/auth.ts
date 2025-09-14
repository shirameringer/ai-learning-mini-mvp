// web/src/lib/auth.ts
export type User = {
    id: number;
    name?: string;
    phone: string;
  };
  
  const STORAGE_KEY = 'ai-learning:user';
  
  // Read current user from localStorage
  export function getUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
  
  // Save user to localStorage (after successful login/register)
  export function setUser(user: User): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  
  // Remove user (for logout)
  export function clearUser(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  // Convenience
  export function isAuthed(): boolean {
    return !!getUser();
  }
  
