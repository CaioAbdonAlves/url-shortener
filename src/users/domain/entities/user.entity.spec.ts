import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      'test-id',
      'test@example.com',
      'hashedPassword',
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    );
  });

  describe('constructor', () => {
    it('should create a user with all properties', () => {
      expect(user.getId).toBe('test-id');
      expect(user.getEmail).toBe('test@example.com');
      expect(user.getPassword).toBe('hashedPassword');
      expect(user.getCreatedAt).toEqual(new Date('2023-01-01'));
      expect(user.getUpdatedAt).toEqual(new Date('2023-01-01'));
    });
  });

  describe('updatePassword', () => {
    it('should update password and updatedAt', () => {
      const newPassword = 'newHashedPassword';
      const oldUpdatedAt = user.getUpdatedAt;

      user.updatePassword(newPassword);

      expect(user.getPassword).toBe(newPassword);
      expect(user.getUpdatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('updateEmail', () => {
    it('should update email and updatedAt', () => {
      const newEmail = 'new@example.com';
      const oldUpdatedAt = user.getUpdatedAt;

      user.updateEmail(newEmail);

      expect(user.getEmail).toBe(newEmail);
      expect(user.getUpdatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('getters', () => {
    it('should return correct values', () => {
      expect(user.getId).toBe('test-id');
      expect(user.getEmail).toBe('test@example.com');
      expect(user.getPassword).toBe('hashedPassword');
      expect(user.getCreatedAt).toEqual(new Date('2023-01-01'));
      expect(user.getUpdatedAt).toEqual(new Date('2023-01-01'));
    });
  });
}); 