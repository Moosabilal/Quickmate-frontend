export interface IAddress {
    id?: string;
    userId?: string
    label: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    locationCoords?: string;
}