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
    async llenarGasto(
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

  private async seleccionarOpcion(nombre: string) {
    const option = this.page.getByRole('option', { name: nombre });
    await expect(option).toBeVisible();
    await option.click();
  }

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

}