/**
 * Pantalla de cuenta pestaña 3 tiene 2 metodos
 * no autenticado muestra formulario login registro
 * autenticado muestra perfil del usuario con opciones de editardatos
 * acceder al panel admin/aux ver pedidos segun rol
 */

/**importar componentes de React native para constuir la pantalla
 * ActivityIndicator, spiner de carga circular
 *  Alert, dialogos emergentes nativos del sistema 
 *  Image, muestra las imagenes 
 *  Pressable, area tactil 
 *  ScrollView, contenedor con scroll vertical
 *  StyleSheet, crea los estilos de forma optimatizada
 *  Text, muestra texto plano en pantalla
 *  View, contenedor generico equivale a un div en html
*/

//manejo de variables de estado local
import { useState } from 'react';
//importar componentes 
import { ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { router } from "expo-router";
//Ionicons libreria de iconos vectoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../src/context/AuthContext';
//themedText : texto q aplica colores del tema del dispositivo de manera automatica claro u oscuro
import { ThemedText } from "@/components/themed-text";
//themedView : color de fondo automatico segun el tema del dispositivo
import { ThemedView } from "@/components/themed-View";

/**
 * AuthCtx define la forma del objeto devuelto por useAuth es necesario
 * porque AuthContext.js esta en javascript no typescript y el compilador no los reconoce
 */
type AuthCtx = {
    //user datos del usuario autenticado. null si no inicio sesion
    user: { nombre?: string, email?: string, rol?: string } | null;
    //isAuthenticated: true si hay sesion activa
    isAuthenticated: boolean;
    // isLoading: true mientras se verifica si hay sesion guardada al abrir la app
    isLoading: boolean;
    //login: funcion que recibe el email y contraseña lanza error si falla
    login: (email: string, password: string)=> Promise<unknown>;
    //register funcion que registra un nuevo usuario lanza error si falla
    register: (data: {nombre: string, apellido: string, email: string, password: string, telefono?: string, direccion?: string }) => Promise<unknown>;
    //logout: funcion de cerrar la la sesion del usuario
    logout: () => Promise<void>;
    //updatePerfil: funcion que actualiza los datos del usuario
    updatePerfil: (data: { nombre?: string, email?: string, password?: string }) => Promise<unknown>;
};

//routerPush navega apilando la nueva pantalla permite volver atras con la opcion de atras
//se usa as unknown as para evitar errores de typescript con contextos router

const routerPush = (path: string) => (router as unknown as {push: (p: string) => void }).push(path);

//componente principal del tad de cuenta
export default function TabTwoScreen() {
    const { user, isAuthenticated, logout, login, register, isLoading, updatePerfil } = useAuth() as unknown as AuthCtx;
    //estado del formulario login y registro 
    //isRegisterMode true mostrar formulario de registro false mostrar login
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    //Campos del formulario de registro y login
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPasword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    //loadingSubmit true mientras se procesa el login o registro evita el doble envio
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    //mensajes de retroalimentacion al usuario (error o exito)
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccesMessage] = useState('');

    //estado de edicion de perfil
    //editMode true mostrar campos editables false modo lectura
    const [editMode, setEditMode] = useState(false);
    //campos editables del perfil
    const [editNombre, setEditNombre] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    //saving perfil true mientras se guarda el perfil en backend
    const [savingPerfil, setSavingPerfil] = useState(false);
    //mensajes del formulario de edicionm de perfil
    const [perfilError, setPerfilError] = useState('');
    const [pefilSuccess, setPerfilSuccess] = useState('');

    //function resetFeedback
    //Limpia los mensajes de error y exito del formulario login y registro 
    const resetFeedback = () => {
        setErrorMessage('');
        setSuccesMessage('');
    };

    //funcion: handleLogout
    //cierra la sesion y resetea todos los campos el usuario vuelva a ver formulario
    const handleLogout = async () => {
        await logout(); //llama el contexto de cerrar sesion 
        setEmail('');
        setPasword('');
        setConfirmPassword('');
        setNombre('');
        setApellido('');
        setTelefono('');
        setDireccion('');
        setIsRegisterMode('');
        setErrorMessage('');
        setSuccesMessage('');
    };
    
    //funcion handleSubmit
    //valida y envia el formulario de login o registro segun el modo activo
    const handleSubmit = async () => {
        resetFeedback(); //limpia mensajes anteriores de validar

        if (isRegisterMode) {
            //validaciones de registro 
            //todos los campos marcados con * son obligatorios
            if (!nombre || !apellido || !email || !password || !confirmPassword) {
                setErrorMessage('completa todos los campos obligatorios *.');
                return;
            }

            //las contraseñas deben coincidir
            if (password !== confirmPassword) {
                setErrorMessage('las contraseñas no coinsiden');
                return;
            }

            //la contraseña debe tener minimo 6 caracteres
            if (password.length < 6) {
                setErrorMessage('la contraseña debe tener al menos 6 caracteres');
                return;
            }

            //Telefono si se proporciona debe ser colombiano (10 digitos y debe empezar con 3)
            if (telefono && !/^3\d{9}$/.test(telefono)) {
                setErrorMessage('Telefono invalido: 10 digitos iniciando con 3');
                return;
            }
        } else {
            //validaciones de login
            if (!email || !password) {
                setErrorMessage('ingresa tu correo y contraseña');
                return;
            }
        }

        //activa el spiner y bloquea el boton para evitar multiples envios
        setLoadingSubmit(true);
        try {
            if (isRegisterMode) {
                //llama a register() del contexto con los datos del formulario
                //el operador spread condicional ... solo incluye telefono/direccion si no estan vacios
                await register({ nombre, apellido, email, password, 
                    ...(telefono ? { telefono } : {}),
                    ...(direccion ? { direccion } : {}),
                });
                setSuccesMessage('Registro exitoso! ahora inicia seison');
                setIsRegisterMode(false); //vuelve al modo login tras el registro exitoso
                //limpia los campos que no se comparten en el formulario login
                setPasword('');
                setConfirmPassword('');
                setNombre('');
                setApellido('');
                setTelefono('');
                setDireccion('');
            } else {
                //llama a login del contexto con el email y contraseña
                await login(email, password);
                setSuccesMessage('Sesion iniciada correctamente');
            }
        } catch (error: unknown) {
            //si el backend devuelve error muestra su mensaje. sino muestra uno generico
            setErrorMessage((error as { message?: string })?.message || 'No fue posible completar la accion');
        } finally {
            //siempre desactiva el spiner al terminar exito y error 
            setLoadingSubmit(false);
        }
    };

    /**
     * funcion handleGuardPerfil
     * valida y envia los cambios al perfil del usuario autenticado
     */

    const handleGuardPerfil = async  () => {
        setPerfilError('');
        setPerfilSuccess('');
        //al menos uno de los tres campos debe estar modificado
        if (!editNombre.trim() && !editEmail.trim() && !editPassword.trim()) {
            setPerfilError('Modifica al menos un campo ');
            return;
        }
    }
}