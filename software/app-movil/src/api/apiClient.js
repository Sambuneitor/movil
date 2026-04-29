//este archivo centraliza axios para todas las peticiones HTTP al backend
//configura la URL base y el tienpo maximo de espera desde las constantes 
//inteceptor de peticion: adjunta automaticamente el token JWT si existe
//interceptor de respuesta: normaliza los errores para que todo el codigo reciba 
//siempre un objeto Error con un mensaje legible 

import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS } from '../utils/constants';