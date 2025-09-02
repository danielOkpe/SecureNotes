import { User } from "../services/user";

export interface Authenticated{
    isAuthenticated: boolean;
    user: User | null;
}