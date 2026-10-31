import { assert } from "node:console";
import { log } from "evlog";
import { AppListProvider, ProviderType } from "./provider";

export class QQDownloaderProvider extends AppListProvider {
  static readonly providerName = QQDownloaderProvider.name;
  protected uin?: string;

  async init() {
    const uuid = await fetch("https://sj.qq.com/app", {
      headers: { ...this.extraHeaders },
    }).then(
      (res) =>
        res.headers.get("set-cookie")?.match(/YYB_HOME_UUID=(?<uuid>[^;]+);/)
          ?.groups?.uuid,
    );
    assert(uuid, "Failed to fetch cookie");
    this.uin = uuid;
    log.debug({
      action: "init",
      provider: QQDownloaderProvider.providerName,
      type: ProviderType[this.providerType],
      uin: uuid,
    });
  }

  async retrieve(page: number) {
    const uin = this.uin;
    assert(uin, "UIN is not initialized");

    const response = await fetch(
      "https://yybadaccess.3g.qq.com/v2/dynamicard_yybhome",
      {
        headers: {
          ...this.extraHeaders,
          "Cache-Control": "no-cache",
          "Content-Type": "text/plain;charset=UTF-8",
        },
        referrer: "https://sj.qq.com/app",
        method: "POST",
        body: JSON.stringify({
          head: {
            cmd: "dynamicard_yybhome",
            authInfo: { businessId: "AuthName" },
            deviceInfo: { platformType: 2, platform: 2 },
            userInfo: { guid: uin },
            expSceneIds: "",
            hostAppInfo: {
              scene: {
                [ProviderType.APP]: "app_center",
                [ProviderType.GAME]: "game_center",
              }[this.providerType],
            },
          },
          body: {
            bid: "yybhome",
            offset: 0,
            size: 10,
            preview: false,
            listS: {
              region: { repStr: ["CN"] },
              cate_alias: { repStr: ["all"] },
            },
            listI: { limit: { repInt: [24] }, offset: { repInt: [page] } },
            layout: {
              [ProviderType.APP]: "YYB_HOME_APP_LIBRARY_LIST",
              [ProviderType.GAME]: "YYB_HOME_GAME_LIBRARY_LIST_ALGRITHM",
            }[this.providerType],
          },
        }),
      },
    );

    assert(response.ok, "Failed to fetch data");
    const { ret, data } = await response.json();
    assert(ret === 0, "Failed to fetch data");

    return Object.fromEntries(
      data.components[0].data.itemData.map(
        ({ pkg_name, name }: { pkg_name: string; name: string }) => [
          pkg_name,
          name,
        ],
      ),
    );
  }
}
