import { Logger } from '../utils/logger.js';

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log info messages with emoji', () => {
    Logger.info('Test message');
    expect(console.log).toHaveBeenCalledWith('ℹ️  Test message');
  });

  it('should log success messages with emoji', () => {
    Logger.success('Success message');
    expect(console.log).toHaveBeenCalledWith('✅ Success message');
  });

  it('should log warning messages with emoji', () => {
    Logger.warn('Warning message');
    expect(console.warn).toHaveBeenCalledWith('⚠️  Warning message');
  });

  it('should log error messages with emoji', () => {
    Logger.error('Error message');
    expect(console.error).toHaveBeenCalledWith('❌ Error message', undefined);
  });

  it('should log target messages with emoji', () => {
    Logger.target('Target message');
    expect(console.log).toHaveBeenCalledWith('🎯 Target message');
  });

  it('should log processing messages with emoji', () => {
    Logger.processing('Processing message');
    expect(console.log).toHaveBeenCalledWith('📋 Processing message');
  });

  it('should log celebration messages with emoji', () => {
    Logger.celebrate('Celebration message');
    expect(console.log).toHaveBeenCalledWith('🎉 Celebration message');
  });
});
