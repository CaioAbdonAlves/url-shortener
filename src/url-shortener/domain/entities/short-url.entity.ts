export class ShortUrl {
  constructor(
    private readonly id: string,
    private readonly originalUrl: string,
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
    return this.deletedAt !== undefined;
  }

  // Factory method
  static create(
    originalUrl: string,
    shortCode: string,
    userId?: string,
  ): ShortUrl {
    return new ShortUrl(crypto.randomUUID(), originalUrl, shortCode, userId);
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
