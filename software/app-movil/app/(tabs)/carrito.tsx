/**
 * Pantalla del carrito de compras y sus respectivas gestiones no require que este autenticado solo para hacer compras
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

import { ActivityIndicator, ActivityIndicatorBase, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
//Ionicons libreria de iconos vectoriales para react native 
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../../src/context/AuthContext';
import { useCarrito } from '../../src/context/CarritoContext';

//carritoctx tefine la forma de los datos que devuelve useCarrito
//TypeScript necesita esto porque CarritoContext.js esta en javaScript
type CarritoCtx = {
    //items lista de productos en el carrito
    items: { id: string, nombre?: string, precio?: number, cantidad: number, imagen?: string }[];
    //total suma: total en pesos colombianos de todos los item
    total: number;
    //total items: numero total de items del carrito 
    totalItems: number;
    //loading true mientras el contexto carga los datos iniciales 
    loading: boolean;
    //cambiar cantidad: actualiza la cantidad de un producto
    cambiarCantidad: (id: string, cantidad: number) => Promise<void>;
    //eliminar item: elimina un producto del carrito
    eliminarItem: (id: string) => Promise<void>;
    //vaciar carrito: elimina todos los productos del carrito
    vaciarCarrito: () => Promise<void>;
};

//HELPERS de navegacion 
//expo Router tipifica router de forma extricta y expone .push/replace
//directamente en typescipt, se usa as unknow as .... para forzar el tipo 
//y poder llamar a las funciones de navegacion sin errores de compilacion

//routerPush navega a una nueva pantalla aplicandola, es decir, se puede volver atras 
const routerPush = (path: string) => (router as unknown as { push: (p: string) => void }).push(path);
//routerReplace navega a una pantalla remplazando la actual recuerda que se puede volver a atras
const routerReplace = (path: string) => (router as unknown as { replace: (p: string) => void }).replace(path);

//fmt: formatea un numero como precio en pesos colombianos eje fmt (15000) -> $15.000
const fmt = (n: number) => `$${Number(n).toLocaleString('es-Co')}`;

//componente principal carrito Screen
export default function CarritoScreen() {
    //obtiene el contexto de auth solo si el usuarioesta autenticado
    const { isAuthenticated } = useAuth() as { isAuthenticated: boolean };

    //obtiene del contexto del carrito los datos y funciones necesarias
    //se usa as CarritoCtx porque el contexto de js y typescript no infiere en tipos
    const { items, total, loading, cambiarCantidad, eliminarItem, vaciarCarrito } = useCarrito() as CarritoCtx;

    //pantalla de carga 
    //si el carrito aun esta cargando por ejemplo recuperando datos guardados 
    //se muestra un spinner centrado en lugar del contenido normal

    if (loading) {
        return (
            <view style={styles.centered}>
                {/* spinner cirvula color indigo*/}
                <ActivityIndicator size="large" color="#6366f1"/>
                <text style={styles.loadingText}>Cargando Carrito ....</text>
            </view>
        );
    }

    //funcion handleIrACheckout o sea pagar
    //si el usuario no esta autenticado muestra el dialogo de inicio de sesion
    //si esta autenticado navega directamente a la pantalla de pagos 
    const handleIrACheckout = () => {
        if (!isAuthenticated) {
            Alert.alert(
                'Inicia sesion',
                'Debes iniciar sesion para proceder al pago',
                [
                    //boton "cancelar" cierra el dialogo sin hacer nada
                    { text: 'cancelar', style: 'cancel' },
                    //boton iniciar sesion lleva a pestaña cuenta explore.tsx
                    { text: 'Iniciar Sesion', onPress: () => routerReplace('/tabs/explore') },
                ]
            );
            return; //sale de la funcion
        }
        //usuario autenticado navega a la pantalla de pagos
        routerPush('/checkout');
    };
}