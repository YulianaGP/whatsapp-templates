// LAB 15: Persistencia con JSON y LocalStorage
// Integración con el Store centralizado existente

// Constante para la clave de LocalStorage
const STORAGE_KEY = 'whatsapp_templates_data';

// HU1: Guardar plantillas en LocalStorage
function guardarPlantillas() {
    try {
        // Obtener el estado actual del store
        const estadoActual = window.templateStore.getState();
        
        // Serializar el estado completo a JSON
        const datosParaGuardar = JSON.stringify(estadoActual);
        
        // Guardar en LocalStorage
        localStorage.setItem(STORAGE_KEY, datosParaGuardar);
        
        console.log('✅ Plantillas guardadas en LocalStorage');
        return true;
    } catch (error) {
        console.error('❌ Error al guardar plantillas:', error);
        mostrarNotificacion('Error al guardar plantillas', 'error');
        return false;
    }
}

// HU2: Cargar plantillas desde LocalStorage
function cargarPlantillas() {
    try {
        // Obtener datos desde LocalStorage
        const datosGuardados = localStorage.getItem(STORAGE_KEY);
        
        // Usar operador ternario para manejar caso inicial vacío
        const estadoCargado = datosGuardados ? JSON.parse(datosGuardados) : null;
        
        // Si hay datos válidos, cargarlos en el store
        if (estadoCargado && estadoCargado.plantillas) {
            // Validar estructura de datos
            if (Array.isArray(estadoCargado.plantillas)) {
                // Restaurar fechas de creación (JSON convierte Date a string)
                const plantillasConFechas = estadoCargado.plantillas.map(plantilla => ({
                    ...plantilla,
                    fechaCreacion: new Date(plantilla.fechaCreacion)
                }));
                
                // Actualizar estado en el store manteniendo la estructura
                const nuevoEstado = {
                    ...estadoCargado,
                    plantillas: plantillasConFechas
                };
                
                window.templateStore.setState(nuevoEstado);
                console.log(`✅ ${plantillasConFechas.length} plantillas cargadas desde LocalStorage`);
                return true;
            }
        }
        
        console.log('ℹ️ No hay plantillas guardadas, iniciando con estado vacío');
        return false;
    } catch (error) {
        console.error('❌ Error al cargar plantillas:', error);
        mostrarNotificacion('Error al cargar plantillas guardadas', 'error');
        return false;
    }
}

// HU3: Eliminar todas las plantillas (Reset)
function resetearPlantillas() {
    try {
        // Limpiar LocalStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // Resetear el store al estado inicial
        const estadoInicial = {
            plantillas: [],
            modoVista: 'lista',
            filtros: {
                busqueda: '',
                hashtag: ''
            }
        };
        
        window.templateStore.setState(estadoInicial);
        
        console.log('✅ Todas las plantillas eliminadas');
        mostrarNotificacion('Todas las plantillas han sido eliminadas', 'success');
        return true;
    } catch (error) {
        console.error('❌ Error al resetear plantillas:', error);
        mostrarNotificacion('Error al eliminar plantillas', 'error');
        return false;
    }
}

// Función para validar datos de LocalStorage (Logro Adicional 2)
function validarDatosLocalStorage(datos) {
    if (!datos || typeof datos !== 'object') return false;
    
    // Validar estructura mínima requerida
    const estructura = {
        plantillas: Array.isArray(datos.plantillas),
        modoVista: typeof datos.modoVista === 'string',
        filtros: datos.filtros && typeof datos.filtros === 'object'
    };
    
    return Object.values(estructura).every(valido => valido);
}

// Función para mostrar el tamaño de datos en LocalStorage
function obtenerEstadisticasStorage() {
    try {
        const datos = localStorage.getItem(STORAGE_KEY);
        const tamaño = datos ? new Blob([datos]).size : 0;
        const plantillas = datos ? JSON.parse(datos).plantillas?.length || 0 : 0;
        
        return {
            tamaño: tamaño,
            tamañoLegible: formatearTamaño(tamaño),
            plantillas: plantillas,
            disponible: true
        };
    } catch (error) {
        return {
            tamaño: 0,
            tamañoLegible: '0 B',
            plantillas: 0,
            disponible: false,
            error: error.message
        };
    }
}

// Función auxiliar para formatear tamaños
function formatearTamaño(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Función para exportar plantillas como JSON (Funcionalidad extra)
function exportarPlantillas() {
    try {
        const estadoActual = window.templateStore.getState();
        const datosExportacion = {
            plantillas: estadoActual.plantillas,
            fechaExportacion: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(datosExportacion, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `plantillas_whatsapp_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarNotificacion('Plantillas exportadas correctamente', 'success');
    } catch (error) {
        console.error('❌ Error al exportar:', error);
        mostrarNotificacion('Error al exportar plantillas', 'error');
    }
}

// Función para importar plantillas desde JSON (Funcionalidad extra)
function importarPlantillas(archivo) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datosImportados = JSON.parse(e.target.result);
            
            if (datosImportados.plantillas && Array.isArray(datosImportados.plantillas)) {
                // Agregar plantillas importadas a las existentes
                const estadoActual = window.templateStore.getState();
                const plantillasExistentes = estadoActual.plantillas;
                
                // Evitar duplicados por título
                const nuevasPlantillas = datosImportados.plantillas.filter(nueva => 
                    !plantillasExistentes.some(existente => existente.titulo === nueva.titulo)
                );
                
                if (nuevasPlantillas.length > 0) {
                    nuevasPlantillas.forEach(plantilla => {
                        window.templateStore.agregarPlantilla({
                            ...plantilla,
                            fechaCreacion: new Date(plantilla.fechaCreacion || Date.now())
                        });
                    });
                    
                    guardarPlantillas(); // Persistir los cambios
                    renderPlantillas();
                    actualizarEstadisticas();
                    actualizarOpcionesHashtag();
                    
                    mostrarNotificacion(`${nuevasPlantillas.length} plantillas importadas correctamente`, 'success');
                } else {
                    mostrarNotificacion('No se importaron plantillas (posibles duplicados)', 'info');
                }
            } else {
                mostrarNotificacion('Formato de archivo inválido', 'error');
            }
        } catch (error) {
            console.error('❌ Error al importar:', error);
            mostrarNotificacion('Error al importar plantillas', 'error');
        }
    };
    reader.readAsText(archivo);
}

// Función para verificar disponibilidad de LocalStorage
function verificarLocalStorage() {
    try {
        const test = 'test_storage';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        console.error('❌ LocalStorage no disponible:', error);
        return false;
    }
}

// Auto-guardar después de cada operación CRUD (Integration con Store existente)
function integrarAutoGuardado() {
    // Interceptar las funciones del store para auto-guardar
    const storeOriginal = window.templateStore;
    
    // Guardar referencias a funciones originales
    const agregarOriginal = storeOriginal.agregarPlantilla;
    const eliminarOriginal = storeOriginal.eliminarPlantilla;
    const setStateOriginal = storeOriginal.setState;
    
    // Sobrescribir con auto-guardado
    storeOriginal.agregarPlantilla = function(plantilla) {
        const resultado = agregarOriginal.call(this, plantilla);
        guardarPlantillas(); // Auto-guardar después de agregar
        return resultado;
    };
    
    storeOriginal.eliminarPlantilla = function(titulo) {
        const resultado = eliminarOriginal.call(this, titulo);
        guardarPlantillas(); // Auto-guardar después de eliminar
        return resultado;
    };
    
    storeOriginal.setState = function(nuevoEstado) {
        const resultado = setStateOriginal.call(this, nuevoEstado);
        // Solo auto-guardar si cambiaron las plantillas
        if (nuevoEstado.plantillas) {
            guardarPlantillas();
        }
        return resultado;
    };
}

// Inicialización de la persistencia
function inicializarPersistencia() {
    if (!verificarLocalStorage()) {
        console.warn('⚠️ LocalStorage no disponible, funcionando solo en memoria');
        mostrarNotificacion('Almacenamiento local no disponible', 'error');
        return false;
    }
    
    // Cargar plantillas al iniciar
    const cargaExitosa = cargarPlantillas();
    
    // Integrar auto-guardado
    integrarAutoGuardado();
    
    console.log('✅ Sistema de persistencia inicializado');
    return cargaExitosa;
}

// Hacer funciones disponibles globalmente
window.persistencia = {
    guardar: guardarPlantillas,
    cargar: cargarPlantillas,
    resetear: resetearPlantillas,
    exportar: exportarPlantillas,
    importar: importarPlantillas,
    estadisticas: obtenerEstadisticasStorage,
    inicializar: inicializarPersistencia
};
