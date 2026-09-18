export type Listing = {
  id: string; title: string; price: number; image: string; municipality: string; category: string;
  seller: string; sellerInitials: string; verified?: boolean; featured?: boolean; whatsapp: string; phone: string;
  postedAt: string; condition?: 'جديد' | 'مستعمل' | 'خدمة'; views?: number; description?: string;
};
