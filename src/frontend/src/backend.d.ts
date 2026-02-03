import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    id: bigint;
    categoryId: bigint;
    name: string;
    description: string;
    available: boolean;
    price: bigint;
}
export interface OrderItem {
    itemId: bigint;
    quantity: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    total: bigint;
    customer: Principal;
    timestamp: bigint;
    items: Array<OrderItem>;
}
export interface Category {
    id: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, description: string): Promise<bigint>;
    createItem(name: string, categoryId: bigint, description: string, price: bigint, available: boolean): Promise<bigint>;
    deleteCategory(categoryId: bigint): Promise<void>;
    deleteItem(itemId: bigint): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllItems(): Promise<Array<Item>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomerOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(orderItems: Array<OrderItem>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCategory(categoryId: bigint, name: string, description: string): Promise<void>;
    updateItem(itemId: bigint, name: string, categoryId: bigint, description: string, price: bigint, available: boolean): Promise<void>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
}
