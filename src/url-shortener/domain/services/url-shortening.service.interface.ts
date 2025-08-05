export interface IUrlShorteningService {
  generateShortCode(): Promise<string>;
  validateUrl(url: string): boolean;
}
