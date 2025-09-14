export type User = { id: number; name: string; phone: string };

export type Category = {
  id: number;
  name: string;
  subCategories: SubCategory[];
};

export type SubCategory = {
  id: number;
  name: string;
  categoryId: number;
};
