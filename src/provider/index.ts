import { AppChinaProvider } from "./appchina";
import { QQDownloaderProvider } from "./qqdownloader";
export * from "./provider";

export const providers = [AppChinaProvider, QQDownloaderProvider] as const;
export type Provider = typeof providers[number];