import { User } from "../models/user";

export interface Authenticated{
    isAuthenticated: boolean;
    user: User | null;
}