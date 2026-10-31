export enum ProviderType {
  APP,
  GAME,
}

export abstract class AppListProvider {
  static readonly providerName: string;
  static readonly providerTypes = [ProviderType.APP, ProviderType.GAME];

  constructor(
    protected readonly providerType: ProviderType = ProviderType.APP,
    protected readonly extraHeaders: Record<string, string> = {},
  ) {}

  get isExhausted() {
    return true;
  }

  abstract init(): Promise<void>;

  abstract retrieve(page: number): Promise<Record<string, string>>;
}
