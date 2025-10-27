export interface Promo {
  code: string;
  discountPercent: number;
  description: string;
  daysLeft?: number;
  expiresAt?: string;
  usageCount?: number;
  maxUsage?: number;
}

export interface PromoValidationResponse {
  valid: boolean;
  code: string;
  discountPercent: number;
  msg?: string;
}
