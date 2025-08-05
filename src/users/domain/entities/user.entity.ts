export class User {
  constructor(
    private readonly id: string,
    private email: string, // Removido readonly para permitir modificação
    private password: string, // Removido readonly para permitir modificação
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date(),
  ) {}

  // Getters
  get getId(): string {
    return this.id;
  }

  get getEmail(): string {
    return this.email;
  }

  get getPassword(): string {
    return this.password;
  }

  get getCreatedAt(): Date {
    return this.createdAt;
  }

  get getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business rules
  public updatePassword(newPassword: string): void {
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  public updateEmail(newEmail: string): void {
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  // Factory method
  static create(email: string, password: string): User {
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
    
    return new User(generateId(), email, password);
  }

  // Reconstruction method
  static reconstruct(data: {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.createdAt,
      data.updatedAt,
    );
  }
}
