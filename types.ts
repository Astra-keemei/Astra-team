import { Timestamp } from "firebase/firestore";

export enum PlanType {
  FREE = "FREE",
  PAID = "PAID"
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  upline_uid: string;
  is_active: boolean;
  plan_type: PlanType;
  total_balance: number;
  createdAt: Timestamp;
}

export interface Commission {
  id: string;
  recipient_uid: string;
  source_uid: string;
  source_name?: string; // Optional helper for UI
  level: number;
  amount: number;
  timestamp: Timestamp;
}

export const PLAN_PRICE = 800;
export const DEFAULT_ADMIN_UID = "ADMIN_DEFAULT_UID_001"; // Placeholder for root node