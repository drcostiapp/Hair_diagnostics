export interface AppConfig {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  mlServiceUrl: string;
  adminPhones: string[];
  mockOtp: string | null;
  swipeLimit: number;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgres://prelude:prelude@localhost:5432/prelude',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  adminPhones: (process.env.ADMIN_PHONE || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean),
  // MOCK_OTP unset => accept any code. Set to a value to require that code.
  mockOtp:
    process.env.MOCK_OTP === undefined ? '0000' : process.env.MOCK_OTP || null,
  swipeLimit: parseInt(process.env.SWIPE_LIMIT || '100', 10),
});
