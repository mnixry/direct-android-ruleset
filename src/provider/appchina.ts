import { assert } from "console";
import { AppListProvider, ProviderType } from "./provider";
import * as Cheerio from "cheerio";

export class AppChinaProvider extends AppListProvider {
  static readonly providerName = AppChinaProvider.name;
  protected readonly appTypeIds = new Set<number>();

  async init(): Promise<void> {
    const response = await fetch(
      {
        [ProviderType.APP]: "http://m.appchina.com/soft",
        [ProviderType.GAME]: "http://m.appchina.com/game",
      }[this.providerType],
      {
        headers: { ...this.extraHeaders },
      }
    );
    assert(response.ok, "Failed to fetch AppChina");
    const html = await response.text();
    const $ = Cheerio.load(html);

    for (const option of $(".ClassifyBox li a").toArray()) {
      const href = $(option).attr("href");
      if (!href) continue;
      const match = href.match(/(?<typeId>\d+)$/);
      if (!match) continue;
      this.appTypeIds.add(+match.groups!.typeId);
    }

    this.appTypeIds.add(
      {
        [ProviderType.APP]: 30,
        [ProviderType.GAME]: 40,
      }[this.providerType]
    );
  }

  async retrieve(page: number): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    for (const appTypeId of this.appTypeIds) {
      const response = await fetch(
        `http://m.appchina.com/ajax/cat/${appTypeId}/${page}`,
        {
          headers: {
            ...this.extraHeaders,
            "Cache-Control": "no-cache",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      assert(response.ok, "Failed to fetch AppChina");

      const { nextPage, list } = await response.text().then((text) => {
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error(e, text);
          throw e;
        }
      });

      if (!(nextPage && list.length)) {
        this.appTypeIds.delete(appTypeId);
        continue;
      }

      Object.assign(
        results,
        ...list.map(({ name, packageName }: any) => ({ [packageName]: name }))
      );
    }

    return results;
  }
}
