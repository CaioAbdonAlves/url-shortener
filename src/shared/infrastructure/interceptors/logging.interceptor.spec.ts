import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';
import { Request } from 'express';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  describe('intercept', () => {
    it('should log request and response successfully', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/test',
        body: { test: 'data' },
        get: jest.fn().mockReturnValue('test-user-agent'),
        user: { email: 'test@example.com' },
      } as any as Request;

      const mockResponse = {
        statusCode: 200,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual({ success: true });
          done();
        },
        error: done,
      });
    });

    it('should log request and error', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/test',
        body: {},
        get: jest.fn().mockReturnValue('test-user-agent'),
        user: null,
      } as any as Request;

      const mockResponse = {
        statusCode: 500,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockError = new Error('Test error');
      const mockCallHandler = {
        handle: () => throwError(() => mockError),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => done(new Error('Should have thrown an error')),
        error: (error) => {
          expect(error).toBe(mockError);
          done();
        },
      });
    });

    it('should handle request without body', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/test',
        body: null,
        get: jest.fn().mockReturnValue(''),
        user: null,
      } as any as Request;

      const mockResponse = {
        statusCode: 200,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual({ success: true });
          done();
        },
        error: done,
      });
    });

    it('should handle request with authenticated user', (done) => {
      const mockRequest = {
        method: 'PUT',
        url: '/test',
        body: { update: 'data' },
        get: jest.fn().mockReturnValue('chrome-user-agent'),
        user: { email: 'authenticated@example.com' },
      } as any as Request;

      const mockResponse = {
        statusCode: 200,
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as ExecutionContext;

      const mockCallHandler = {
        handle: () => of({ success: true }),
      } as CallHandler;

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (data) => {
          expect(data).toEqual({ success: true });
          done();
        },
        error: done,
      });
    });
  });
});
