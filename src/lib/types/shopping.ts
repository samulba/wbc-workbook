export type ShoppingPriority = "must_have" | "nice_to_have" | "maybe_later";

export interface ShoppingList {
  id:           string;
  user_id:      string;
  project_id:   string | null;
  name:         string;
  budget_total: number | null;
  share_token:  string | null;
  is_shared:    boolean;
  created_at:   string;
  updated_at:   string;
}

export interface ShoppingListItem {
  id:           string;
  list_id:      string;
  product_id:   string | null;
  custom_name:  string | null;
  custom_price: number | null;
  custom_url:   string | null;
  custom_image: string | null;
  quantity:     number;
  priority:     ShoppingPriority;
  is_purchased: boolean;
  notes:        string | null;
  created_at:   string;
}

/** Resolved view combining custom fields with joined product data. */
export interface ShoppingItemResolved {
  id:           string;
  list_id:      string;
  product_id:   string | null;
  name:         string;
  price:        number | null;
  url:          string | null;
  image:        string | null;
  quantity:     number;
  priority:     ShoppingPriority;
  is_purchased: boolean;
  notes:        string | null;
  created_at:   string;
}

export const PRIORITY_LABELS: Record<ShoppingPriority, string> = {
  must_have:    "Must-have",
  nice_to_have: "Nice-to-have",
  maybe_later:  "Maybe später",
};

export const PRIORITY_ORDER: Record<ShoppingPriority, number> = {
  must_have:    0,
  nice_to_have: 1,
  maybe_later:  2,
};
