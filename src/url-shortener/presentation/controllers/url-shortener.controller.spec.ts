import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { UrlShortenerController } from './url-shortener.controller';
import { ShortenUrlUseCase } from '../../application/use-cases/shorten-url.use-case';
import { GetUrlsByUserUseCase } from '../../application/use-cases/get-urls-by-user.use-case';
import { UpdateUrlUseCase } from '../../application/use-cases/update-url.use-case';
import { DeleteUrlUseCase } from '../../application/use-cases/delete-url.use-case';
import { ShortenUrlDto, UpdateUrlDto } from '../../application/dtos/url-shortener.dto';
import { RequestWithUser } from '../../../auth/presentation/interfaces/request-with-user.interface';

describe('UrlShortenerController', () => {
  let controller: UrlShortenerController;
  let shortenUrlUseCase: jest.Mocked<ShortenUrlUseCase>;
  let getUrlsByUserUseCase: jest.Mocked<GetUrlsByUserUseCase>;
  let updateUrlUseCase: jest.Mocked<UpdateUrlUseCase>;
  let deleteUrlUseCase: jest.Mocked<DeleteUrlUseCase>;

  beforeEach(async () => {
    const mockShortenUrlUseCase = {
      execute: jest.fn(),
    };

    const mockGetUrlsByUserUseCase = {
      execute: jest.fn(),
    };

    const mockUpdateUrlUseCase = {
      execute: jest.fn(),
    };

    const mockDeleteUrlUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [
        {
          provide: ShortenUrlUseCase,
          useValue: mockShortenUrlUseCase,
        },
        {
          provide: GetUrlsByUserUseCase,
          useValue: mockGetUrlsByUserUseCase,
        },
        {
          provide: UpdateUrlUseCase,
          useValue: mockUpdateUrlUseCase,
        },
        {
          provide: DeleteUrlUseCase,
          useValue: mockDeleteUrlUseCase,
        },
      ],
    }).compile();

    controller = module.get<UrlShortenerController>(UrlShortenerController);
    shortenUrlUseCase = module.get(ShortenUrlUseCase);
    getUrlsByUserUseCase = module.get(GetUrlsByUserUseCase);
    updateUrlUseCase = module.get(UpdateUrlUseCase);
    deleteUrlUseCase = module.get(DeleteUrlUseCase);
  });

  describe('shortenUrl', () => {
    it('should create short URL with authenticated user', async () => {
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'https://example.com',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer jwt-token',
        },
      } as RequestWithUser;

      const expectedResponse = {
        id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        clicksCount: 0,
        createdAt: new Date(),
      };

      shortenUrlUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.shortenUrl(shortenUrlDto, mockRequest);

      expect(shortenUrlUseCase.execute).toHaveBeenCalledWith(shortenUrlDto, 'user-id');
      expect(result).toEqual(expectedResponse);
    });

    it('should create short URL without authenticated user', async () => {
      const shortenUrlDto: ShortenUrlDto = {
        originalUrl: 'https://example.com',
      };

      const mockRequest = {
        headers: {},
      } as RequestWithUser;

      const expectedResponse = {
        id: 'url-id',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        clicksCount: 0,
        createdAt: new Date(),
      };

      shortenUrlUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.shortenUrl(shortenUrlDto, mockRequest);

      expect(shortenUrlUseCase.execute).toHaveBeenCalledWith(shortenUrlDto, null);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getUrlsByUser', () => {
    it('should return user URLs', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as RequestWithUser;

      const expectedResponse = [
        {
          id: 'url-id',
          originalUrl: 'https://example.com',
          shortCode: 'abc123',
          shortUrl: 'http://localhost:3000/abc123',
          clicksCount: 5,
          createdAt: new Date(),
        },
      ];

      getUrlsByUserUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getUrlsByUser(mockRequest);

      expect(getUrlsByUserUseCase.execute).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateUrl', () => {
    it('should update URL', async () => {
      const updateUrlDto: UpdateUrlDto = {
        originalUrl: 'https://newexample.com',
      };

      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as RequestWithUser;

      const expectedResponse = {
        id: 'url-id',
        originalUrl: 'https://newexample.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3000/abc123',
        clicksCount: 5,
        createdAt: new Date(),
      };

      updateUrlUseCase.execute.mockResolvedValue(expectedResponse);

      const result = await controller.updateUrl('url-id', updateUrlDto, mockRequest);

      expect(updateUrlUseCase.execute).toHaveBeenCalledWith('url-id', updateUrlDto, 'user-id');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteUrl', () => {
    it('should delete URL', async () => {
      const mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      } as RequestWithUser;

      deleteUrlUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.deleteUrl('url-id', mockRequest);

      expect(deleteUrlUseCase.execute).toHaveBeenCalledWith('url-id', 'user-id');
      expect(result).toBeUndefined();
    });
  });
}); 