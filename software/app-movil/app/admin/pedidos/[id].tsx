/**
 * Este archivo y pantalla de detalle de un pedido especifico para el administrador 
 * recibe el parametro dinamico desde la url
 * consulta el backend para traer los datos del pedido
 * muestra los datos del cliente estado actual total fecha y lista productos
 * permite cambiar el estado del pedido pendiente -> enviado -> entragado o cancelar si esta en pendiente
 */

/**importar componentes de React native para constuir la pantalla
 * hooks de react:
 * useEffect ejecuta el codigo a al montar el componente o cuando cambian las dependencias
 * useMemo memoriza valores calculados para evitar recalculos innecesarios
 * useState maneja variables de estado local
*/

//manejo de variables de estado local
import { useState, useEffect, } from 'react';
//importar componentes 
//Dimensions optiene al ancho y alto de la pantalla para hacer diseños responsivos
//flatlist lista optomizada con virtualizacion para mostrar grandes cantidades de datos
//modal mostrar detalles de contenido en ventana emergente

import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

//lee los parametros de la url para obtener el id del pedido 
import { useLocalSearchParams } from "expo-router";
//themedText : texto q aplica colores del tema del dispositivo de manera automatica claro u oscuro
import { ThemedText } from "@/components/themed-text";
//cliente http axios con JWT
import api from '../../../src/api/apiClient';
import apiClient from '../../../src/api/apiClient';

/**
 * TIPOS
 * representa un item de la lista de productos del pedido
 * todos los campos son opcionales ? porque ql backend puede enviarlos todos 
 */
type Detalle = {
    producto?: { nombre?: string }; // solo del los productos comprados
    cantidad?: number;
    precio?: number; //precio unitario del producto
};

//repredenta el pedido completo tal como lo devuelve el backend
type Pedido = {
    id: string;
    estado?: string;
    total?: number;
    createAt?: string;
    usuario?: {
        nombre?: string;
        apellido?: string;
        email?: string;
    };
    detalles?: Detalle[]; //arreglo de prodcutos incluidos en el pedido
};

/**
 * componente principal
 */
export default function AdminPedidoDetalleScreen() {
    /**
     * parametros de ruta 
     * useLocalSearchParams lee los segmentos dinamicos de la url
     * como el archivo se llama [id].tsx el parametro se llama id es decir si un pedido se llama 38 el id es 38
     */

    const { id } = useLocalSearchParams<{ id: string }>();

    //estado local 
    const [pedido, setPedido] = useState<Pedido | null>(null); //datos del pedido. null = aun no cargado
    const [loading, setLoadig] = useState(true); //activo mientras hace peticion api
    const [errorMessage, setErrorMessage] = useState(''); //mensaje de errorsi falla la carga
    const [cambiando, setCambiando] = useState(false); //true mientras se esta cambiando el estado evita el doble click

    /**
     * funcion fetcnPedido
     * llama el endpoint get/admin/pedidos/:id y guarda el resultado en estado
     * se usa tanto en el montaje inicial useEffect despues de cambiar estado
     */

    const fetchPedido = async () => {
        setLoadig(true); //muestra el spinner
        setErrorMessage('');
        try {
            //peticion get autenticada el token JWT lo agrega el apiClient automaticamente
            const res = await apiClient.get(`/admin/pedidos/${id}`);
            //la respuesta tiene estructura { data : data: { pedido ....
            //el operador ? evita errores si algun nivel es undefined
            setPedido(res.data?.data?.pedido || null);
        } catch (error: unknown) {
            //si la peticion falla guarda el mensaje de error para mostrarlo en pantalla
            setErrorMessage((error as {message?: string})?.message || 'no se pudo cargar el pedido');
        } finally {
            setLoadig(false); //oculta el spinner
        }
    };

    /**
     * efecto carga inicial
     * se ejecuta cada vez que cambie el parametro id de la url
     * en la practica solo se ejecuta el montar porque no se navega entre ids diferentes
     */

    useEffect(() => {
        fetchPedido();
        /**
         * eslint-disable-next-line react-hooks/exhaustive-deps
         * fechPedido no se incluye en el array de dependencias para evitar bucles infinitos
         * el lint warnig se suprime con el comentario de arriba 
         */
    }, [id]);

    /**
     * funcion cambiar estado
     * envia un PATCH al backend para actualizar es estado del pedido
     * parametro: nuevoEstado el estado al que se requiere transicionar
     * enviado, entregado, o cancelado
     */
    const cambiarEstado = async (nuevoEstado: string) => {
        setCambiando(true); //bloquea los botones par evitar clicks multiples
        try {
            //PATCH /admin/pedidos/:id/estado con le nuevo estado en el body
            await apiClient.patch(`/admin/pedidos/${id}/estado`, { estado: nuevoEstado});
        } catch {
            //si falla muestra un alert nativo con el mensaje de error
            Alert.alert('Error', 'No se pudo cambiar el estado');
        } finally {
            setCambiando(false); //desbloquea los botones
        }
    };
}