/**
 * Gestión de categorías en el panel de administración
 * Lista de todas las categorías del sistema con descripción y estado
 * Permite buscar en tiempo real y activar/desactivar categorías
 * Solo administradores pueden eliminar categorías
 */

//manejo de variables de estado local
import { useEffect, useState } from 'react';
//importar componentes de React Native
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";

//navegación
import { router } from "expo-router";
import { ThemedText } from '../../components/themed-text';
import apiClient from '../../src/api/apiClient';
import { useAuth } from '../../src/context/AuthContext'

/**
 * tipo de categoria
 * estructura de la categoria recibida del backend
 */
type Categoria = {
    id?: number | string;
    nombre?: string;
    descripcion?: string;
    activo?: boolean;
};

type AuthUser = { rol?: string };

/**
 * helpers de navegacion 
 */
const push = (path: string) => 
(router as unknown as { push: (p: string) => void}).push(path);

export default function AdminCategoriasScreen() {
    /**
     * contexto de autenticacion 
     */
    const { user } = useAuth() as { user: AuthUser | null };
    
    /**
     * Estado local
     */
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [busqueda, setBusqueda] = useState('');

    /**
     * Función para cargar categorías
     * consulta GET /admin/categorias con filtro de búsqueda
     */
    const fetchCategorias = async (search = '') => {
        setLoading(true);
        setErrorMessage('');
        try {
            const params: string[] = [];
            if (search.trim()) params.push(`buscar=${encodeURIComponent(search.trim())}`);
            const url = `/admin/categorias?${params.length ? params.join('&') : ''}`;
            
            const res = await apiClient.get(url);
            const categoriasData: Categoria[] = res.data?.data?.categorias || [];
            setCategorias(categoriasData);
        } catch (error: unknown) {
            setErrorMessage((error as { message?: string })?.message || 'Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias('');
    }, []);

    const isAdmin = user?.rol === 'administrador';

    // ── RENDERIZADO ───────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* Título de la pantalla */}
            <ThemedText type="title">Categorías</ThemedText>

            {/* ── BARRA DE BÚSQUEDA ──────────────────────────────────────────── */}
            <View style={styles.searchRow}>
                <TextInput
                    placeholder="Buscar categoría..."
                    value={busqueda}
                    onChangeText={(text) => {
                        setBusqueda(text);
                        fetchCategorias(text); // Búsqueda en tiempo real.
                    }}
                    style={styles.input}
                />
                <Pressable style={styles.searchBtn} onPress={() => fetchCategorias(busqueda)}>
                    <ThemedText style={styles.searchBtnText}>Buscar</ThemedText>
                </Pressable>
            </View>

            {/* Botón para crear una nueva categoría */}
            {isAdmin && (
                <Pressable style={styles.createBtn} onPress={() => {
                    // Abre un Alert para crear categoría rápidamente
                    Alert.prompt(
                        'Nueva Categoría',
                        'Nombre de la categoría',
                        [
                            {
                                text: 'Cancelar',
                                onPress: () => {},
                                style: 'cancel',
                            },
                            {
                                text: 'Crear',
                                onPress: async (nombre?: string) => {
                                    if (nombre?.trim()) {
                                        try {
                                            await apiClient.post('/admin/categorias', {
                                                nombre: nombre.trim(),
                                                descripcion: '',
                                            });
                                            Alert.alert('Éxito', 'Categoría creada');
                                            fetchCategorias(busqueda);
                                        } catch (error) {
                                            Alert.alert('Error', 'No se pudo crear la categoría');
                                        }
                                    }
                                },
                            },
                        ]
                    );
                }}>
                    <ThemedText style={styles.createBtnText}>+ Crear categoría</ThemedText>
                </Pressable>
            )}

            {/* Spinner de carga */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" />
                    <ThemedText>Cargando categorías...</ThemedText>
                </View>
            ) : null}

            {/* Mensaje de error */}
            {errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}

            {/* ── LISTA DE CATEGORÍAS ──────────────────────────────────────────── */}
            <FlatList
                data={categorias}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        {/* Área izquierda: datos de la categoría */}
                        <View style={styles.cardBody}>
                            {/* Nombre de la categoría */}
                            <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
                            {/* Descripción */}
                            <ThemedText numberOfLines={2}>{item.descripcion || 'Sin descripción'}</ThemedText>
                            {/* Estado activo/inactivo */}
                            <ThemedText style={styles.meta}>{item.activo ? 'Activo' : 'Inactivo'}</ThemedText>
                        </View>

                        {/* ── BOTONES DE ACCIÓN (solo admin) ──────────────────────── */}
                        {isAdmin && (
                            <View style={styles.actionsRow}>
                                {/* Botón Activar/Desactivar */}
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: item.activo ? '#b93a32' : '#218f4c' }]}
                                    onPress={async () => {
                                        try {
                                            await apiClient.patch(`/admin/categorias/${item.id}/toggle`);
                                            fetchCategorias(busqueda);
                                        } catch {
                                            Alert.alert('Error', 'No se pudo cambiar el estado');
                                        }
                                    }}
                                >
                                    <ThemedText style={styles.actionBtnText}>{item.activo ? 'Desactivar' : 'Activar'}</ThemedText>
                                </Pressable>

                                {/* Botón Eliminar */}
                                <Pressable
                                    style={[styles.actionBtn, { backgroundColor: '#b93a32' }]}
                                    onPress={() => {
                                        Alert.alert('Eliminar categoría', '¿Está seguro de eliminar esta categoría?', [
                                            { text: 'Cancelar', style: 'cancel' },
                                            {
                                                text: 'Eliminar',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    try {
                                                        await apiClient.delete(`/admin/categorias/${item.id}`);
                                                        fetchCategorias(busqueda);
                                                    } catch {
                                                        Alert.alert('Error', 'No se pudo eliminar la categoría');
                                                    }
                                                },
                                            },
                                        ]);
                                    }}
                                >
                                    <ThemedText style={styles.actionBtnText}>Eliminar</ThemedText>
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
                ListEmptyComponent={!loading && !errorMessage ? <ThemedText>No hay categorías.</ThemedText> : null}
                style={styles.list}
            />
        </View>
    );
}

// ── ESTILOS ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Contenedor raíz: ocupa toda la pantalla, padding + gap entre elementos.
    container: { flex: 1, padding: 16, gap: 10 },
    centered: { alignItems: 'center', gap: 10, marginVertical: 20 },
    error: { color: '#b93a32' },
    // Fila de búsqueda: input expandible + botón fijo a la derecha.
    searchRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: '#d5d5d5', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#fff' },
    searchBtn: { backgroundColor: '#0a7ea4', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
    searchBtnText: { color: '#fff', fontWeight: '700' },
    // Botón verde para crear nueva categoría.
    createBtn: { backgroundColor: '#218f4c', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
    createBtnText: { color: '#fff', fontWeight: '700' },
    // La lista ocupa todo el espacio disponible.
    list: { flex: 1 },
    // Tarjeta de categoría: fila horizontal con datos y botones de acción.
    card: { flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, padding: 10, backgroundColor: '#fff', marginBottom: 8, alignItems: 'center' },
    // Columna de botones a la derecha de la tarjeta.
    actionsRow: { flexDirection: 'column', gap: 6, marginLeft: 8 },
    // Botón de acción pequeño: el color de fondo se aplica inline.
    actionBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2 },
    actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    // Área de texto: ocupa el espacio restante.
    cardBody: { flex: 1, gap: 2 },
    // Estado en gris secundario.
    meta: { color: '#666', fontSize: 12 },
});
