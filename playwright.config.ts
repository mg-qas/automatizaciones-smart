/*import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect:{timeout: 10000},
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_BASE_URL,
    trace: 'on-first-retry',
    // Otorga permiso de geolocalización a todos los tests
    permissions: ['geolocation'],
    geolocation: { latitude: -12.1222, longitude: -77.0305 }
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'] 
      },
    },
  ],
});
*/


import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 0, // Ajustado a 0 para permitir las esperas de reloj programadas sin cortar el test
  expect:{timeout: 10000},
  fullyParallel: false, // Cambiado a false para procesar en orden secuencial
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 1, // Mantiene 1 worker local para no solapar ejecuciones
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_BASE_URL,
    trace: 'on', // Guarda la traza completa de cada ejecución
    video: 'on', //  AGREGADO: Activa la grabación de video en todos los tests
    // Otorga permiso de geolocalización a todos los tests
    permissions: ['geolocation'],
    geolocation: { latitude: -12.1222, longitude: -77.0305 }
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'] 
      },
    },
  ],
});