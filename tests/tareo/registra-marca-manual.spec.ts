import { test } from '@playwright/test';
import { edicion } from '@data/tareoData';
import { LoginPage, TareoPage } from '@pages';
/*
Comando para que se pueda ejecutar a tal hora determinada, terminal powershell
while ((Get-Date -Format "HH:mm") -ne "16:17") { Start-Sleep -Seconds 10 }; node node_modules/@playwright/test/cli.js test tests/tareo/registra-marca-manual.spec.ts --project=chromium --headed
*/
/*
comando para solo ejecutarla en termina, cmd
npx playwright test tests/tareo/registra-marca-manual.spec.ts --ui

*/




for (const [index, item] of edicion.entries()) {
  test(`Marca manual de ${item.correo}`, async ({ page }) => {
    test.setTimeout(60000);

    const loginPage = new LoginPage(page);
    const tareoPage = new TareoPage(page);

    // 1. Iniciar Sesión
    await loginPage.navegar();
    await loginPage.iniciarSesion(item.correo, item.password);

    //  esta funcion sirve parasperar a que la página cargue completamente tras el login
    await tareoPage.btnPausar.waitFor({ state: 'visible', timeout: 15000 });
    
    // Si la acción requiere estar dentro del módulo Tareo, navega primero:
    // await tareoPage.navegarModulo(); 

    // 2. usar la funcion creada en tareoPage
    const resultado = await tareoPage.gestionarBotonCronometro();

    if (resultado === 'boton deshabilitado') {
      console.log(`El proceso terminó para ${item.correo}: El botón se encuentra deshabilitado.`);
    } else {
      console.log(resultado);
    }
  });
}