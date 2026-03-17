import api from "@/lib/api";
import * as Lucide from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiNavItem = {
  id: string;
  parentId?: string | null;
  title: string;
  icon?: string;
  path: string;
  module?: string;
  isPublic?: boolean;
  isVisible?: boolean;
  roles?: string[];
  isActive?: boolean;
  order?: number;
  children?: ApiNavItem[];
};

export type NavItem = Omit<ApiNavItem, "icon" | "children"> & {
  icon?: LucideIcon;
  children?: NavItem[];
};

export const lucideIconNames = Object.keys(Lucide).filter(
  (k) =>
    // Filter only React component exports (heuristic: PascalCase + component-like export).
    // lucide-react icons are typically React.forwardRef() which is an object, not a function.
    /^[A-Z]/.test(k) &&
    (() => {
      const v = (Lucide as any)[k];
      if (!v) return false;
      if (typeof v === "function") return true;
      if (typeof v === "object" && typeof (v as any).$$typeof !== "undefined")
        return true;
      return false;
    })(),
);

function getIconByName(name?: string): LucideIcon | undefined {
  if (!name) return undefined;
  const Icon = (Lucide as any)[name];
  if (!Icon) return undefined;
  if (typeof Icon === "function") return Icon as LucideIcon;
  if (typeof Icon === "object" && typeof Icon.$$typeof !== "undefined")
    return Icon as LucideIcon;
  return undefined;
}

function mapIcons(items: ApiNavItem[]): NavItem[] {
  return items.map((i) => ({
    ...i,
    icon: getIconByName(i.icon),
    children: i.children ? mapIcons(i.children) : undefined,
  }));
}

export const navigationService = {
  async getMyNavigation(): Promise<NavItem[]> {
    const res = await api.get<ApiSuccess<{ items: ApiNavItem[] }>>("/navigation");
    return mapIcons(res.data?.items || []);
  },

  async getConfig(): Promise<ApiNavItem[]> {
    const res = await api.get<ApiSuccess<{ items: ApiNavItem[] }>>(
      "/navigation/config",
    );
    return res.data?.items || [];
  },

  async createItem(item: Partial<ApiNavItem>) {
    const res = await api.post<ApiSuccess<{ item: ApiNavItem }>>(
      "/navigation/items",
      item,
    );
    return res.data.item;
  },

  async updateItem(id: string, patch: Partial<ApiNavItem>) {
    const res = await api.put<ApiSuccess<{ item: ApiNavItem }>>(
      `/navigation/items/${id}`,
      patch,
    );
    return res.data.item;
  },

  async deleteItem(id: string) {
    await api.delete(`/navigation/items/${id}`);
  },
};

