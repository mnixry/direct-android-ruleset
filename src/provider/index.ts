import { AppChinaProvider } from "./appchina";
import { QQDownloaderProvider } from "./qqdownloader";
import { XiaomiProvider } from "./xiaomi";

export * from "./provider";

export const providers = [
  AppChinaProvider,
  QQDownloaderProvider,
  XiaomiProvider,
] as const;
export type Provider = (typeof providers)[number];
