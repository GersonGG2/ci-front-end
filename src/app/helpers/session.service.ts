import * as CryptoJS from 'crypto-js';

export class Session {

    private static user: any = null;
    private static userdy: any = null;

    static setViewInsp(val: string): void {
        localStorage.setItem('editInsp', val);
    }

    static isViewInsp(val: string): boolean {
        return localStorage.getItem('editInsp') === val;
    }

    static removeViewInsp(): void {
        localStorage.removeItem('editInsp');
    }

    static setUser(user: any): void {
        this.user = user;
    }

    static getUser(): any {
        return this.user ?? {}
    }

    static isAdmin(): boolean {
        return this.user && this.user.adminFlag === 'Y';
    }

    static getSession(): string {
        if (this.user) {
            const request = JSON.stringify({
                admin: this.user.adminFlag === 'Y',
                userId: this.user.userId,
                branchId: this.user.branch ? this.user.branch.branchId : null,
                userName: this.user.fullName,
                userEmail: this.user.emailAddress,
                menuId: this.user.menu ? this.user.menu.menuId : null,
            });

            const encrypted = CryptoJS.AES.encrypt(request,
                'tipmexico.com').toString();

            return encrypted;
        }
        return '******';
    }

}