/**
 * administra las funciones de usuario 
 * activa desactiva y elimina desde el panel del admin
 */

import api from "../api/apiClient";

//activa un usuario
export async function activarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}`/activar);
    return res.data;
}

//desactiva usuario
export async function desactivarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}`/desactivar);
    return res.data;
}

//elimina un usuario
export async function deleteUsuario(id) {
    const res = await api.delete(`/admin/usuarios/${id}`);
    return res.data;
}