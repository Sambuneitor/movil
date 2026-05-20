/**
 * Formulario para crear o editar un producto (Admin).
 */
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createProduct, updateProduct } from '../../src/services/adminService';

type Producto = {
    id?: string;
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock?: number;
    imagen?: string;
};

export default function AdminProductoForm() {
    const router = useRouter();
    const params = useLocalSearchParams<{ producto?: string }>();

    let producto: Producto | undefined;
    if (params.producto) {
        try {
            producto = JSON.parse(params.producto) as Producto;
        } catch {
            producto = undefined;
        }
    }

    const editing = !!producto;

    const [nombre, setNombre] = useState(producto?.nombre ?? '');
    const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
    const [precio, setPrecio] = useState(producto?.precio?.toString() ?? '');
    const [stock, setStock] = useState(producto?.stock?.toString() ?? '');
    const [imagen, setImagen] = useState(producto?.imagen ?? '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!nombre || !descripcion || !precio || !stock) {
            Alert.alert('Error', 'Todos los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            const data = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                stock: parseInt(stock, 10),
                imagen,
            };

            if (editing && producto) {
                await updateProduct(producto.id || '', data);
                Alert.alert('Exitoso', 'Producto actualizado');
            } else {
                await createProduct(data);
                Alert.alert('Exito', 'Producto creado');
            }
            router.back();
        } catch {
            Alert.alert('Error', 'No se pudo guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

            <Text style={styles.label}>Descripcion</Text>
            <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} multiline />

            <Text style={styles.label}>Precio</Text>
            <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />

            <Text style={styles.label}>Stock</Text>
            <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />

            <Text style={styles.label}>URL Imagen</Text>
            <TextInput style={styles.input} value={imagen} onChangeText={setImagen} />

            <Button title={editing ? 'Actualizar' : 'Crear'} onPress={handleSubmit} disabled={loading} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
    label: { fontWeight: 'bold', marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 5, marginBottom: 10 },
});
