import { assert } from "node:console";
import { log } from "evlog";
import { AppListProvider, ProviderType } from "./provider";

export class BiliGameProvider extends AppListProvider {
  static readonly providerName = BiliGameProvider.name;
  static readonly providerTypes = [ProviderType.GAME];
  private readonly tagIds = new Set<string>();

  get isExhausted() {
    return this.tagIds.size === 0;
  }

  async init(): Promise<void> {
    const response = await fetch(
      "https://le3-api.game.bilibili.com/pc/game/tag/get_category_list?page_num=0&page_size=100",
      { headers: { ...this.extraHeaders, Accept: "application/json" } },
    );
    assert(response.ok, "Failed to fetch BiliGame tags");
    const { code, data } = await response.json();
    assert(
      code === 0 && Array.isArray(data) && data.length > 0,
      "Invalid BiliGame tags",
    );
    for (const { tag_id } of data) this.tagIds.add(tag_id);
    log.debug({
      action: "init",
      provider: BiliGameProvider.providerName,
      type: ProviderType[this.providerType],
      tagIds: [...this.tagIds],
    });
  }

  async retrieve(page: number): Promise<Record<string, string>> {
    if (this.isExhausted) return {};

    const results: Record<string, string> = Object.create(null);
    for (const tagId of this.tagIds) {
      const query = new URLSearchParams({
        tag_id: tagId,
        page_num: String(page + 1),
        page_size: "20",
        sdk_type: "1",
      });
      const response = await fetch(
        `https://line3-h5-mobile-api.biligame.com/game/center/h5/tag/game/list/v2?${query}`,
        { headers: { ...this.extraHeaders, Accept: "application/json" } },
      );
      assert(response.ok, "Failed to fetch BiliGame");
      const { code, data } = await response.json();
      assert(
        code === 0 && Array.isArray(data?.list),
        "Invalid BiliGame response",
      );
      if (data.list.length === 0) {
        this.tagIds.delete(tagId);
        continue;
      }
      for (const { android_pkg_name, title } of data.list) {
        if (android_pkg_name) results[android_pkg_name] = title;
      }
    }
    return results;
  }
}
