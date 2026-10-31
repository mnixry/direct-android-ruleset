import { assert } from "node:console";
import * as Cheerio from "cheerio";
import { log } from "evlog";
import { AppListProvider, ProviderType } from "./provider";

const PAGE_SIZE = 10;

export class TapTapProvider extends AppListProvider {
  static readonly providerName = TapTapProvider.name;
  static readonly providerTypes = [ProviderType.GAME];
  private readonly tags = new Set<string>();

  get isExhausted() {
    return this.tags.size === 0;
  }

  async init(): Promise<void> {
    const response = await fetch("https://www.taptap.cn/categories/all", {
      headers: { ...this.extraHeaders },
    });
    assert(response.ok, "Failed to fetch TapTap tags");
    const $ = Cheerio.load(await response.text());
    for (const anchor of $("a[href^='/tag/']").toArray()) {
      const tag = $(anchor).text().trim();
      if (tag) this.tags.add(tag);
    }
    assert(this.tags.size > 0, "No TapTap tags found");
    log.debug({
      action: "init",
      provider: TapTapProvider.providerName,
      type: ProviderType[this.providerType],
      tags: [...this.tags],
    });
  }

  async retrieve(page: number): Promise<Record<string, string>> {
    if (this.isExhausted) return {};

    const results: Record<string, string> = Object.create(null);
    for (const tag of this.tags) {
      const query = new URLSearchParams({
        tag,
        from: String(page * PAGE_SIZE),
        limit: String(PAGE_SIZE),
        "X-UA": "V=1&PN=WebApp&LANG=zh_CN&VN_CODE=100&LOC=CN&PLT=PC&DS=Android",
      });
      const response = await fetch(
        `https://www.taptap.cn/webapiv2/app-tag/v1/by-tag?${query}`,
        { headers: { ...this.extraHeaders, Accept: "application/json" } },
      );
      assert(response.ok, "Failed to fetch TapTap");
      const { success, data } = await response.json();
      assert(
        success &&
          Array.isArray(data?.list) &&
          typeof data.next_page === "string",
        "Invalid TapTap response",
      );
      if (!data.next_page || data.list.length === 0) this.tags.delete(tag);
      for (const { identifier, title } of data.list) {
        if (identifier) results[identifier] = title;
      }
    }
    return results;
  }
}
