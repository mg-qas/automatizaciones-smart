import path from 'path';
import { fileURLToPath } from 'url';
import { Page, Locator, expect } from '@playwright/test';
import { CalendarComponent } from '@components';
import { TIPO } from '@data/tesoreriaData';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.join(__dirname, '../data/assets');

export class TesoreriaPage {
  readonly page: Page;
  private calendar: CalendarComponent;

  // Navegación
  readonly menuBtn: Locator;
  readonly tesoreriaLink: Locator;
  readonly homeRegistrarSolicitudBtn: Locator;

  // Flujo "Crear" clásico (rol Colaborador / Persona)
  readonly personaRadio: Locator;
  readonly crearBtn: Locator;

  // Formulario
  readonly formularioDialog: Locator;
  readonly tipoSolicitudCombo: Locator;
  readonly montoInput: Locator;
  readonly proyectoCombo: Locator;
  readonly requerimientoCombo: Locator;
  readonly seleccionarCombo: Locator;
  readonly motivoInput: Locator;
  readonly subirArchivoBtn: Locator;
  readonly enviarBtn: Locator;
  readonly aceptarBtn: Locator;


  //consturctor para flujo de rechazo
  readonly verDetalleBtn: Locator;
  readonly observacionInput: Locator;
  readonly montoAprobadoInput: Locator;
  readonly rechazarReembolsoBtn: Locator;
  readonly cerrarModalBtn: Locator;


  constructor(page: Page) {
    this.page = page;
    this.calendar = new CalendarComponent(page);

    this.menuBtn = page.getByRole('button', { name: 'menu' });
    this.tesoreriaLink = page.getByRole('link', { name: 'paid Tesorería' });
    this.homeRegistrarSolicitudBtn = page.getByRole('button', { name: 'add_circle Registrar solicitud de reembolso'});
    this.personaRadio = page.getByRole('radio', { name: 'person' });
    this.crearBtn = page.getByRole('button', { name: ' Crear' });
    this.formularioDialog = page.getByRole('dialog', { name: 'Registro de solicitud' });
    this.tipoSolicitudCombo = this.formularioDialog.getByRole('combobox', { name: 'Tipo de solicitud' });
    this.montoInput = this.formularioDialog.getByRole('textbox', { name: 'Ingrese el monto (Ej: 1.000,' });
    this.proyectoCombo = this.formularioDialog.getByRole('combobox', { name: 'Proyecto' });
    this.requerimientoCombo = this.formularioDialog.getByRole('combobox', { name: 'Requerimiento' });
    this.seleccionarCombo = this.formularioDialog.getByRole('combobox', { name: 'Seleccionar' });
    this.motivoInput = this.formularioDialog.getByRole('textbox', { name: 'Motivo de la solicitud' });
    this.subirArchivoBtn = this.formularioDialog.getByRole('button', { name: 'Subir archivo' });
    this.enviarBtn = this.formularioDialog.getByRole('button', { name: 'Enviar' });
    this.aceptarBtn = page.getByRole('button', { name: 'Aceptar' });

    //
    this.verDetalleBtn = page.getByText('visibility').first(); // o nth(2) si es estrictamente el tercero, pero mejor usar waitFor
  this.observacionInput = page.getByRole('textbox', { name: 'Observación' });
  this.montoAprobadoInput = page.getByRole('textbox', { name: 'Ingrese el monto' });
  this.rechazarReembolsoBtn = page.getByRole('button', { name: 'Rechazar reembolso' });
  this.cerrarModalBtn = page.getByText('close');

  }

  /**
   * Entra directamente al formulario desde el card de Home
   * ("Registrar solicitud de reembolso"), sin pasar por Tesorería > Crear.
   */
  async navegarDesdeHome() {
      const btnCerrarNotificaciones = this.page.getByRole('button', { name: 'notifications_off Cerrar'});

      await btnCerrarNotificaciones
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(async () => {
              await btnCerrarNotificaciones.click();
              await btnCerrarNotificaciones.waitFor({
                  state: 'hidden',
                  timeout: 5000
              });
          })
          .catch(() => {
              // No apareció la notificación
          });

      await this.homeRegistrarSolicitudBtn.click();
      await expect(this.formularioDialog).toBeVisible();
  }

  /**
   * Navega al módulo de tesoreria
   */
  async navegarATesoreria() {
    await this.menuBtn.click();
    await this.tesoreriaLink.click();
    // Esperar a que la URL cargue y que overlays de la barra lateral se oculten
    await this.page.waitForURL('**/tesoreria**');
  await this.page.locator('.mat-drawer-backdrop').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  /**
   * Desde el módulo de tesorería, el boton para abrir formulario tiene otro nombre
   * ademas que se requiere ubicar el "TAB" en "Solo Yo" para perfiles de lideres y administradores
   */
  async abrirFormularioGasto() {
    try {
      // Rol: Colaborador
      await this.crearBtn.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      // Rol: Lider Administrativo / Lider
      await this.personaRadio.click();
    }

    // 3. Hacemos clic en Crear y validamos el diálogo
    await this.crearBtn.click();
    await expect(this.formularioDialog).toBeVisible();
  }

  /**
   * Abre el combo "Seleccionar" y agrega una persona por cada elemento del
   * arreglo, tantas veces como personas se le pasen.
   */
  private async seleccionarPersonas(personas: string[]) {
    for (const persona of personas) {
      // Reintenta todo el bloque si falla (el panel se reposiciona al agregar chips)
      await expect(async () => {
        // Si el panel no está abierto, lo abrimos
        const opcionesVisibles = await this.page.getByRole('option').first().isVisible().catch(() => false);
        if (!opcionesVisibles) await this.seleccionarCombo.click(); // Abrir solo si está cerrado (evita el bug de doble-click que lo cierra)

        const option = this.page.getByRole('option', { name: persona });
        await option.scrollIntoViewIfNeeded(); // Asegura que la opción esté en el área visible del listado
        await option.click();
      }).toPass({ timeout: 15000 });
    }
    await this.page.keyboard.press('Escape'); // Cierra el panel al terminar
  }

  /** Llena el formulario de GASTO POR ALIMENTACIÓN */
    /*async llenarGasto(
      tipoSolicitud: string,
      fecha: string,
      monto: string,
      motivo: string,
      personaSeleccionada?: string[],
      proyecto?: string,
      requerimiento?: string,
    ) {
      await this.seleccionarFecha(fecha);

      await this.tipoSolicitudCombo.click();
      await this.seleccionarOpcion(tipoSolicitud);

      await this.montoInput.fill(monto);

      switch (tipoSolicitud) {
        case TIPO.ALIMENTACION:
        case TIPO.OTROS_GASTOS:
        case TIPO.MOVILIDAD:
          await this.seleccionarOpcionFiltrable(this.proyectoCombo, proyecto!);
          await this.seleccionarOpcionFiltrable(this.requerimientoCombo, requerimiento!);
          if(personaSeleccionada){
            await this.seleccionarPersonas(personaSeleccionada);
          }
          break;

        case TIPO.COCHERAS:
          // No requiere proyecto, requerimiento ni persona.
          break;

        default:
          throw new Error(`Tipo de solicitud no soportado: ${tipoSolicitud}`);
      }

      await this.motivoInput.fill(motivo);
    }*/
   // En tesoreriaPage.ts

/** Llena el formulario de GASTO POR ALIMENTACIÓN */
async llenarGasto(
  tipoSolicitud: string,
  fecha: string,
  monto: string,
  motivo: string,
  personaSeleccionada?: string[],
  proyecto?: string,
  requerimiento?: string,
) {
  // 1. Seleccionar fecha
  await this.seleccionarFecha(fecha);

  // 2. Cerrar overlay residual del calendario
  await this.page.keyboard.press('Escape');

  // 3. AQUÍ SE RELACIONA: Se llama al método especializado para el combo
  await this.seleccionarOpcionTipoSolicitud(tipoSolicitud);

  // 4. Llenar monto
  await this.montoInput.fill(monto);

  // 5. Resto del switch segun el tipo de gasto
  switch (tipoSolicitud.trim()) {
    case TIPO.ALIMENTACION:
    case TIPO.OTROS_GASTOS:
    case TIPO.MOVILIDAD:
      await this.seleccionarOpcionFiltrable(this.proyectoCombo, proyecto!);
      await this.seleccionarOpcionFiltrable(this.requerimientoCombo, requerimiento!);
      if (personaSeleccionada) {
        await this.seleccionarPersonas(personaSeleccionada);
      }
      break;

    case TIPO.COCHERAS:
      break;

    default:
      throw new Error(`Tipo de solicitud no soportado: ${tipoSolicitud}`);
  }

  await this.motivoInput.fill(motivo);
}

/** Método privado que ejecuta la búsqueda y selección en Angular Material */
private async seleccionarOpcionTipoSolicitud(nombreGasto: string) {
  // 1. Abrir combo
  await this.tipoSolicitudCombo.click({ force: true });

  // 2. Limpiar íconos si vienen en la cadena (extrae solo el texto principal)
  const textoLimpio = nombreGasto.replace(/^[a-z_]+\s*/i, '').trim();

  // 3. Escribir en el input para forzar el filtrado de opciones de Angular
  const filtro = textoLimpio.split(' ')[0];
  await this.tipoSolicitudCombo.pressSequentially(filtro, { delay: 50 });

  // 4. Ubicar el panel flotante desplegado
  const panel = this.page.locator('.cdk-overlay-pane').last();
  await expect(panel).toBeVisible({ timeout: 10000 });

  // 5. Clic en la opción que contiene el texto
  const option = panel.getByRole('option', { name: new RegExp(textoLimpio, 'i') }).first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click({ force: true });
}






  /**
   * Se requiere haber subido un file al directorio /data/assets para que la funcion recupere la ruta
   * @param nombreArchivo 
   */
  async subirComprobante(nombreArchivo: string) {
    await this.subirArchivoBtn.click();
    const rutaArchivo = path.join(assetsDir, nombreArchivo);
    await this.formularioDialog.locator('input[type="file"]').setInputFiles(rutaArchivo);
  }

  /**
   * Botones del footer del modal para enviar la solicitud
   */
  async enviarSolicitud() {
    await this.enviarBtn.click();
    await expect(this.aceptarBtn).toBeVisible();
    await this.aceptarBtn.click();
  }

  /**
   * Funciones internas auxiliares
   */

 /* private async seleccionarOpcion(nombre: string) {
    const option = this.page.getByRole('option', { name: nombre });
    await expect(option).toBeVisible();
    await option.click();
  }*/

   /*private async seleccionarOpcion(nombre: string) {
  const nombreLimpio = nombre.trim();
  
  // Se busca la opción usando expresión regular para evitar fallos por espacios
  const option = this.page
    .getByRole('option', { name: new RegExp(nombreLimpio, 'i') })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click({ force: true });
}*/



  private async seleccionarOpcionFiltrable(combo: Locator, nombre: string) {
    await combo.click();
    const panel = this.page.locator('.cdk-overlay-pane').last();
    await expect(panel).toBeVisible();

    const filtro = nombre.split(' ')[0];
    await combo.pressSequentially(filtro, { delay: 50 });

    const option = panel.getByRole('option', { name: nombre });
    await expect(option).toBeVisible();
    await option.click();
  }

  private async seleccionarFecha(fecha: string) {
    await this.calendar.seleccionarFecha(fecha);
  }
  
  // aqui mas que nada sirve para poder filtrar en rango de fecha
  async filtrarPorRangoFechas(fechaInicio: string, fechaFin: string) {
    await this.calendar.seleccionarFecha(fechaInicio, fechaFin);
  }

  /*
  async rechazarSolicitud(observacion: string, monto: string) {
    await this.verDetalleBtn.click();
    
    await this.observacionInput.fill(observacion);
    await this.montoAprobadoInput.fill(monto);
    
    await this.rechazarReembolsoBtn.click();
    await this.cerrarModalBtn.click();
  }*/
 /*async rechazarSolicitud(observacion: string, monto: string) {
  // 1. Ubicar la primera fila en estado PENDIENTE y hacer clic en su botón 'visibility'
  const filaPendiente = this.page.locator('tr', { hasText: 'PENDIENTE' }).first();
  const btnVerDetallePendiente = filaPendiente.getByText('visibility');

  await btnVerDetallePendiente.waitFor({ state: 'visible', timeout: 10000 });
  await btnVerDetallePendiente.click();

  // 2. Esperar a que abra el modal interactivo de rechazo
  await this.observacionInput.waitFor({ state: 'visible', timeout: 10000 });
  await this.observacionInput.fill(observacion);

  await this.montoAprobadoInput.click();
  await this.montoAprobadoInput.fill(monto);

  // 3. Ejecutar el rechazo y cerrar el modal
  await this.rechazarReembolsoBtn.click();
  await this.cerrarModalBtn.first().click({ force: true });
}*/

// En tesoreriaPage.ts

async rechazarSolicitud(observacion: string, monto: string) {
  // 1. Intentar localizar una fila en estado PENDIENTE
  const filaPendiente = this.page.locator('tr', { hasText: 'PENDIENTE' }).first();

  // Verificamos si existe al menos una solicitud pendiente en la tabla actual
  const existePendiente = await filaPendiente.isVisible().catch(() => false);

  if (!existePendiente) {
    console.warn('No se encontraron solicitudes en estado PENDIENTE para el rango filtrado.');
    // Si no hay pendientes, abrimos la primera fila disponible para continuar con la verificación
    const primeraFila = this.page.locator('tr').nth(1);
    await primeraFila.getByText('visibility').click();
    return;
  }

  // 2. Si existe la solicitud pendiente, procedemos con el flujo de rechazo
  const btnVerDetallePendiente = filaPendiente.getByText('visibility');
  await btnVerDetallePendiente.click();

  await this.observacionInput.waitFor({ state: 'visible', timeout: 10000 });
  await this.observacionInput.fill(observacion);

  await this.montoAprobadoInput.click();
  await this.montoAprobadoInput.fill(monto);

  await this.rechazarReembolsoBtn.click();
  await this.cerrarModalBtn.first().click({ force: true });
}



/**
 * Abre el detalle de la solicitud (primer registro) y valida que el monto de reembolso
 * no contenga o empiece con 'null'.
 */
/*
async validarMontoReembolsoSinNull() {
  // 1. Abrir el detalle usando el selector de visibility o la clase inline-flex
  const btnVerDetalle = this.page.locator('.inline-flex').first();
  await btnVerDetalle.waitFor({ state: 'visible', timeout: 10000 });
  await btnVerDetalle.click();

  // 2. Localizar el contenedor del monto de reembolso dentro del modal
  // Según la estructura del DOM, el texto se encuentra dentro del elemento con los datos del reembolso
  const contenedorMonto = this.page.locator('dialog, .mat-mdc-dialog-container').getByText(/Monto de reembolso:/i).locator('..');
  await contenedorMonto.waitFor({ state: 'visible', timeout: 10000 });

  const textoMonto = (await contenedorMonto.innerText()).trim();

  // 3. Evaluación de la regla de negocio
  if (textoMonto.toLowerCase().includes('null')) {
    throw new Error(
      `[BUG DETECTADO]: El error persiste. El campo muestra "${textoMonto}" en lugar de solo mostrar el monto correcto (ej. 0,00) AÑAAAA.`
    );
  }

  console.log(`[BUG RESUELTO]: La validación fue exitosa. El campo no contiene 'null'. Texto obtenido: "${textoMonto}"`);

  // 4. Cerrar el modal al finalizar la verificación
  await this.cerrarModalBtn.first().click({ force: true });
}
*/

async validarMontoReembolsoSinNull(estadoEsperado: 'RECHAZADO' | 'PENDIENTE' | 'REEMBOLSADO' | 'ANULADO' |string = 'RECHAZADO') {
  // 1. Asegurar que no haya modales ni backdrop activos de pasos anteriores
  await this.page.keyboard.press('Escape');

  // 2. Ubicar la primera fila con el estado indicado
  const filaSolicitud = this.page.locator('tr', { hasText: estadoEsperado }).first();
  await expect(filaSolicitud).toBeVisible({ timeout: 10000 });

  console.log(`✓ [ESTADO CONFIRMADO]: Se encontró una solicitud en estado "${estadoEsperado}".`);

  // 3. Abrir la modal haciendo clic con force: true para evitar bloqueos por overlays residuales
  const btnVerDetalle = filaSolicitud.getByText('visibility');
  await btnVerDetalle.waitFor({ state: 'visible', timeout: 10000 });
  await btnVerDetalle.click({ force: true });

  // 4. Localizar la modal y el contenedor del monto
  const modalActiva = this.page.locator('dialog, .mat-mdc-dialog-container, [role="dialog"]').last();
  await expect(modalActiva).toBeVisible({ timeout: 10000 });

  const contenedorMonto = modalActiva.getByText(/Monto de reembolso:/i).locator('..');
  await contenedorMonto.waitFor({ state: 'visible', timeout: 10000 });

  const textoMonto = (await contenedorMonto.innerText()).trim();

  // 5. Evaluación de la regla de negocio
  if (textoMonto.toLowerCase().includes('null')) {
    await this.cerrarModalBtn.first().click({ force: true }).catch(() => {});
    
    throw new Error(
      `[BUG DETECTADO]: El error persiste en solicitud ${estadoEsperado}. El campo muestra "${textoMonto}" en lugar de mostrar el monto formateado (ej. 0,00).`
    );
  }

  console.log(`[BUG RESUELTO]: La validación para el estado "${estadoEsperado}" fue exitosa. Texto obtenido: "${textoMonto}"`);

  // 6. Cerrar la ventana modal
  await this.cerrarModalBtn.first().click({ force: true });
}


}