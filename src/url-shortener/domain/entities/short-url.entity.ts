export class ShortUrl {
  constructor(
    private readonly id: string,
    private originalUrl: string, // Removido readonly para permitir modificação
    private readonly shortCode: string,
    private readonly userId?: string,
    private clicksCount: number = 0,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
    private deletedAt?: Date,
  ) {}

  // Getters
  get getId(): string {
    return this.id;
  }

  get getOriginalUrl(): string {
    return this.originalUrl;
  }

  get getShortCode(): string {
    return this.shortCode;
  }

  get getUserId(): string | undefined {
    return this.userId;
  }

  get getClicksCount(): number {
    return this.clicksCount;
  }

  get getCreatedAt(): Date {
    return this.createdAt;
  }

  get getUpdatedAt(): Date {
    return this.updatedAt;
  }

  get getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  // Business rules
  public incrementClicks(): void {
    if (this.isDeleted()) {
      throw new Error('Cannot increment clicks on deleted URL');
    }
    this.clicksCount++;
    this.updatedAt = new Date();
  }

  public updateOriginalUrl(newUrl: string): void {
    if (this.isDeleted()) {
      throw new Error('Cannot update deleted URL');
    }
    this.originalUrl = newUrl;
    this.updatedAt = new Date();
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  public isDeleted(): boolean {
    return this.deletedAt != null;
  }

  // Factory method
  static create(
    originalUrl: string,
    shortCode: string,
    userId?: string,
  ): ShortUrl {
    // Use crypto.randomUUID() if available, otherwise fallback to Math.random()
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      // Fallback for environments without crypto.randomUUID
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
    
    return new ShortUrl(generateId(), originalUrl, shortCode, userId);
  }

  // Reconstruction method
  static reconstruct(data: {
    id: string;
    originalUrl: string;
    shortCode: string;
    userId?: string;
    clicksCount: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }): ShortUrl {
    return new ShortUrl(
      data.id,
      data.originalUrl,
      data.shortCode,
      data.userId,
      data.clicksCount,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }
}
