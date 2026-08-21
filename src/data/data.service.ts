import { Injectable, signal } from '../framework/core';

export interface User {
    id: number;
    name: string;
    role: string;
}

@Injectable('DataService')
export class DataService {
    currentUser = signal<User | null>(null);
    users = signal<User[]>([
        { id: 1, name: 'DevilBD', role: 'Administrator' },
        { id: 2, name: 'Alice', role: 'Developer' },
        { id: 3, name: 'Bob', role: 'Designer' },
    ]);

    getUser(id: number): User | undefined {
        return this.users().find((u) => u.id === id);
    }

    login(name: string): User {
        const existing = this.users().find((u) => u.name.toLowerCase() === name.toLowerCase());
        const user = existing ?? { id: Date.now(), name, role: 'User' };
        this.currentUser.set(user);
        return user;
    }

    logout(): void {
        this.currentUser.set(null);
    }
}
