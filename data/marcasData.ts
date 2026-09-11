import dotenv from 'dotenv';
dotenv.config();

const defaultPassword = process.env.DEFAULT_QA_PASSWORD || '';

export interface UsuarioMarca {
  correo: string;
  password: string;
  dFecha_Jornada: string;
  dTiempo_Marca: string[];
  nMethod: number;
}

export const usuarios: UsuarioMarca[] = [
  {
    correo: "shirley.gonzales@materiagris.pe",
    password: defaultPassword, 
    dFecha_Jornada: "2026-09-09",
    dTiempo_Marca: [
      "2026-09-09T08:55:00",
      "2026-09-09T14:00:00",
      "2026-09-09T15:00:00",
      "2026-09-09T18:00:00",
      //"2026-08-11T18:15:00",
      //"2026-08-11T20:15:00"
    ],
    nMethod: 6,
  },
  
];



