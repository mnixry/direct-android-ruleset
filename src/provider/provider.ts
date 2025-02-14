export abstract class AppListProvider {
  static readonly providerName: string;

  constructor(
    protected readonly providerType: ProviderType = ProviderType.APP,
    protected readonly extraHeaders: Record<string, string> = {}
  ) {}

  abstract init(): Promise<void>;

  abstract retrieve(page: number): Promise<Record<string, string>>;
}

export enum ProviderType {
  APP,
  GAME,
}
