import { AppChinaProvider } from "./appchina";
import { BiliGameProvider } from "./biligame";
import { QQDownloaderProvider } from "./qqdownloader";
import { TapTapProvider } from "./taptap";
import { XiaomiProvider } from "./xiaomi";

export * from "./provider";

export const providers = [
  AppChinaProvider,
  BiliGameProvider,
  QQDownloaderProvider,
  TapTapProvider,
  XiaomiProvider,
] as const;
export type Provider = (typeof providers)[number];
