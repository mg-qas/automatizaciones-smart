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
    correo: "alfonso.rios@materiagris.pe",
    password: defaultPassword, 
    dFecha_Jornada: "2026-09-04",
    dTiempo_Marca: [
      "2026-09-04T08:55:00",
      //"2026-08-11T13:00:00",
      //"2026-08-11T14:00:00",
      //"2026-08-11T18:00:00",
      //"2026-08-11T18:15:00",
      //"2026-08-11T20:15:00"
    ],
    nMethod: 6,
  },
  
];



