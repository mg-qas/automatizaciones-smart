import { Page } from '@playwright/test';
import { MarcasService } from '@services/marcasService';
import { UsuarioMarca } from '@data/marcasData';
import { UsuarioRepository } from '@repositories/UsuarioRepository';


export class CrearMarcasFlow {

  constructor(
    private readonly marcasService: MarcasService,
    private readonly usuarioRepository: UsuarioRepository
  ) {}

  async ejecutar(page: Page,usuario: UsuarioMarca) {

    const token = await this.obtenerToken(page);

    for(const tiempo of usuario.dTiempo_Marca){
      const { nIdUsuario } = await this.usuarioRepository.obtenerIdsPorCorreo(usuario.correo);

      await this.marcasService.crearMarca(
        token,
        {
          nId_Usuario: nIdUsuario,
          dFecha_Jornada: usuario.dFecha_Jornada,
          dTiempo_Marca: tiempo,
          nTypeInterval: 1,
          sJustificacion:
            'PRUEBA AUTOMATIZADA PW API',
          bAcepta_Marca_Fuera_De_Tiempo:false,
          deviceInfo:{
            nMethod: usuario.nMethod,
            sBrowser:'Biometrico',
            sUid:'ZXRC23012060',
            sOS:'X11; Linux x86_64',
            nWidth:800,
            nHeight:600,
            bEmulated:0
          }
        }
      );

      await page.waitForTimeout(1000);

    }

  }

  private async obtenerToken(page: Page): Promise<string>{
    let token='';
    const listener=(req:any)=>{

      const auth =
        req.headers()['authorization'] ||
        req.headers()['Authorization'];

      if(auth && auth.toLowerCase().startsWith('bearer ')){
        token =auth.replace(/^Bearer\s+/i,'').trim();
      }

    };

    page.on('request',listener);
    let intentos=0;

    while(!token && intentos<20){ //se pone  limite de intentos para no esperar infinatemente
      await page.waitForTimeout(500);
      intentos++;
    }

    page.off('request',listener);

    if(!token){
      throw new Error('No se pudo obtener token');
    }

    return token;
  }

}