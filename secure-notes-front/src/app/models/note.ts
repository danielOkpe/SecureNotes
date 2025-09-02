export interface Note {
    id?: number;
    title?: string;
    content?: string;
    owner_id: number;
    created_at: Date;
    updated_at?: Date;
}