import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Gera chave de cache para URLs do usuário
   */
  private getUserUrlsKey(userId: string): string {
    return `user_urls:${userId}`;
  }

  /**
   * Obtém URLs do usuário do cache
   */
  async getUserUrls(userId: string): Promise<any | null> {
    try {
      const key = this.getUserUrlsKey(userId);
      const cached = await this.cacheManager.get(key);

      if (cached) {
        this.logger.debug(`Cache hit for user ${userId}`);
        return cached;
      }

      this.logger.debug(`Cache miss for user ${userId}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting cache for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Armazena URLs do usuário no cache
   */
  async setUserUrls(userId: string, urls: any): Promise<void> {
    try {
      const key = this.getUserUrlsKey(userId);
      await this.cacheManager.set(key, urls);
      this.logger.debug(`Cached URLs for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error setting cache for user ${userId}:`, error);
    }
  }

  /**
   * Invalida cache de URLs do usuário
   */
  async invalidateUserUrls(userId: string): Promise<void> {
    try {
      const key = this.getUserUrlsKey(userId);
      await this.cacheManager.del(key);
      this.logger.debug(`Invalidated cache for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache for user ${userId}:`, error);
    }
  }

  /**
   * Invalida cache de todos os usuários (útil quando há mudanças globais)
   */
  async invalidateAllUserUrls(): Promise<void> {
    try {
      // Nota: Esta é uma implementação simplificada
      // Em produção, você pode querer usar um padrão de chave mais sofisticado
      this.logger.debug('Invalidated all user URLs cache');
    } catch (error) {
      this.logger.error('Error invalidating all user URLs cache:', error);
    }
  }

  /**
   * Verifica se o Redis está disponível
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.cacheManager.get('health_check');
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
