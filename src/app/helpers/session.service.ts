import * as CryptoJS from 'crypto-js';

export class Session {
    // ... código existente ...

    public static setUser(user: any): void {
        localStorage.setItem('user', JSON.stringify(user));
    }

    public static getUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    public static setToken(token: string): void {
        localStorage.setItem('auth_token', token);
    }

    public static getToken(): string {
        return localStorage.getItem('auth_token') || '';
    }

    public static getSession(): string {
        return localStorage.getItem('session') || this.getToken() || '';
    }
    
    public static clearAll(): void {
        localStorage.clear();
    }


}