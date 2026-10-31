import { assert } from "node:console";
import { AppListProvider, ProviderType } from "./provider";

const APP_CATEGORY_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 27];
const GAME_CATEGORY_ID = 15;
// The configured iPhone user agent returns HTML.
const DESKTOP_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export class XiaomiProvider extends AppListProvider {
  static readonly providerName = XiaomiProvider.name;
  protected readonly categoryIds = new Set<number>();

  async init(): Promise<void> {
    const ids =
      this.providerType === ProviderType.GAME
        ? [GAME_CATEGORY_ID]
        : APP_CATEGORY_IDS;
    for (const id of ids) this.categoryIds.add(id);
  }

  async retrieve(page: number): Promise<Record<string, string>> {
    const results: Record<string, string> = Object.create(null);

    for (const categoryId of this.categoryIds) {
      const query = new URLSearchParams({
        page: String(page),
        categoryId: String(categoryId),
        pageSize: "100",
      });
      const response = await fetch(
        `https://app.mi.com/categotyAllListApi?${query}`,
        {
          headers: {
            ...this.extraHeaders,
            "User-Agent": DESKTOP_USER_AGENT,
            Accept: "application/json",
          },
        },
      );
      assert(response.ok, "Failed to fetch Xiaomi");

      const { data, hasNext } = await response.json();
      assert(Array.isArray(data), "Invalid Xiaomi response");

      if (!hasNext || data.length === 0) {
        this.categoryIds.delete(categoryId);
      }

      for (const { packageName, displayName } of data) {
        results[packageName] = displayName;
      }
    }

    return results;
  }
}
