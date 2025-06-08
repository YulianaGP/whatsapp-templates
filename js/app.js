// Event Listeners para botones de acción
function agregarEventListeners() {
    // Botones de copiar
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            const template = window.templateStore.buscarPlantilla(titulo);
            if (template) {
                // Crear instancia temporal para obtener el texto formateado
                const tempTemplate = new Template(
                    template.titulo,
                    template.mensaje,
                    template.hashtag,
                    template.categoria,
                    template.autor
                );
                
                navigator.clipboard.writeText(tempTemplate.getTextoParaCopiar()).then(() => {
                    mostrarNotificacion('Plantilla copiada al portapapeles', 'success');
                });
            }
        });
    });
    
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            if (confirm(`¿Estás seguro de eliminar la plantilla "${titulo}"?`)) {
                window.templateStore.eliminarPlantilla(titulo);
                renderPlantillas();
                actualizarEstadisticas();
                actualizarOpcionesHashtag();
                mostrarNotificacion('Plantilla eliminada correctamente', 'success');
            }
        });
    });
    
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.currentTarget.dataset.titulo;
            const template = window.templateStore.buscarPlantilla(titulo);
            if (template) {
                cargarPlantillaEnFormulario(template);
            }
        });
    });
}

// Función para cargar plantilla en formulario para edición
function cargarPlantillaEnFormulario(template) {
    document.getElementById('template-title').value = template.titulo;
    document.getElementById('template-hashtag').value = template.hashtag;
    document.getElementById('template-message').value = template.mensaje;
    
    // Eliminar la plantilla original para "editarla"
    window.templateStore.eliminarPlantilla(template.titulo);
    renderPlantillas();
    actualizarEstadisticas();
    actualizarOpcionesHashtag();
    
    // Cambiar texto del botón
    const saveBtn = document.getElementById('save-template-btn');
    saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Actualizar Plantilla</span>';
    
    // Scroll al formulario
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// Actualizar estadísticas usando datos del store
function actualizarEstadisticas() {
    const plantillas = window.templateStore.getPlantillas();
    const total = plantillas.length;
    const categorias = new Set();
    let recientes = 0;
    
    plantillas.forEach(template => {
        categorias.add(template.hashtag);
        categorias.add(template.categoria);
        
        const dias = (new Date() - new Date(template.fechaCreacion)) / (1000 * 60 * 60 * 24);
        if (dias <= 7) recientes++;
    });
    
    const totalElement = document.getElementById('total-templates');
    const categoriesElement = document.getElementById('total-categories');
    const recentElement = document.getElementById('recent-templates');
    const mostUsedElement = document.getElementById('most-used');
    
    if (totalElement) totalElement.textContent = total;
    if (categoriesElement) categoriesElement.textContent = categorias.size;
    if (recentElement) recentElement.textContent = recientes;
    if (mostUsedElement) mostUsedElement.textContent = Math.min(total, 2); // Simulado
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
    
    const colores = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };
    
    notification.classList.add(...colores[tipo].split(' '));
    notification.textContent = mensaje;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Actualizar opciones de hashtag en el filtro
function actualizarOpcionesHashtag() {
    const select = document.getElementById('filter-hashtag');
    if (!select) return;

    // Limpiar opciones actuales excepto "Todos los hashtags"
    const valorSeleccionado = select.value;
    select.innerHTML = '<option value="">Todos los hashtags</option>';

    // Extraer hashtags únicos desde el store
    const plantillas = window.templateStore.getPlantillas();
    const hashtagsUnicos = [...new Set(plantillas.map(p => p.hashtag))];

    hashtagsUnicos.forEach(hashtag => {
        const option = document.createElement('option');
        option.value = hashtag;
        option.textContent = `#${hashtag}`;
        select.appendChild(option);
    });

    // Restaurar selección anterior si aún existe
    if (hashtagsUnicos.includes(valorSeleccionado)) {
        select.value = valorSeleccionado;
    }
}

// Función para limpiar formulario
function limpiarFormulario() {
    const inputTitle = document.getElementById('template-title');
    const inputHashtag = document.getElementById('template-hashtag');
    const inputMessage = document.getElementById('template-message');
    const previewContent = document.getElementById('preview-content');
    const charCount = document.getElementById('char-count');
    const saveBtn = document.getElementById('save-template-btn');

    if (inputTitle) inputTitle.value = '';
    if (inputHashtag) inputHashtag.value = '';
    if (inputMessage) inputMessage.value = '';
    
    if (previewContent) {
        previewContent.innerHTML = 'La vista previa aparecerá aquí mientras escribes...';
        previewContent.classList.add('text-gray-400', 'italic');
        previewContent.classList.remove('text-gray-700');
    }
    
    if (charCount) {
        charCount.textContent = '0/1000 caracteres';
        charCount.classList.remove('text-red-500');
        charCount.classList.add('text-gray-400');
    }
    
    // Restaurar botón de guardar
    if (saveBtn) {
        saveBtn.innerHTML = '<i class="fas fa-save"></i><span>Guardar Plantilla</span>';
    }
}

// Inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const inputTitle = document.getElementById('template-title');
    const inputHashtag = document.getElementById('template-hashtag');
    const inputMessage = document.getElementById('template-message');
    const saveBtn = document.getElementById('save-template-btn');
    const clearBtn = document.getElementById('clear-form-btn');
    const searchInput = document.getElementById('search-templates');
    const filterSelect = document.getElementById('filter-hashtag');
    const previewContent = document.getElementById('preview-content');
    const charCount = document.getElementById('char-count');
    
    // Event Listener para guardar plantilla
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const titulo = inputTitle?.value.trim() || '';
            const hashtag = inputHashtag?.value.trim().replace('#', '') || '';
            const mensaje = inputMessage?.value.trim() || '';
            
            // Validación de campos vacíos
            if (!titulo || !hashtag || !mensaje) {
                mostrarNotificacion('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Validación de duplicado por título
            if (window.templateStore.buscarPlantilla(titulo)) {
                mostrarNotificacion('Ya existe una plantilla con ese título', 'error');
                return;
            }
            
            // Extraer categoría del hashtag (primera palabra)
            const hashtags = hashtag.split(' ').filter(h => h.length > 0);
            const categoria = hashtags.length > 1 ? hashtags[1].replace('#', '') : 'general';
            
            const nuevaPlantilla = new Template(
                titulo,
                mensaje,
                hashtags[0].replace('#', ''),
                categoria,
                'Usuario' // Por ahora hardcodeado
            );
            
            // Usar el store para agregar la plantilla
            window.templateStore.agregarPlantilla(nuevaPlantilla);
            renderPlantillas();
            actualizarEstadisticas();
            actualizarOpcionesHashtag();
            limpiarFormulario();
            mostrarNotificacion('Plantilla guardada correctamente', 'success');
        });
    }
    
    // Event Listener para limpiar formulario
    if (clearBtn) {
        clearBtn.addEventListener('click', limpiarFormulario);
    }
    
    // Event Listeners para búsqueda y filtros
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            window.templateStore.actualizarFiltros({ busqueda: this.value });
            renderPlantillas();
        });
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            window.templateStore.actualizarFiltros({ hashtag: this.value });
            renderPlantillas();
        });
    }
    
    // Vista previa en tiempo real
    function actualizarVistaPrevia() {
        if (!inputMessage || !previewContent) return;
        
        const mensaje = inputMessage.value;
        if (mensaje.trim()) {
            previewContent.innerHTML = mensaje.replace(/\n/g, '<br>');
            previewContent.classList.remove('text-gray-400', 'italic');
            previewContent.classList.add('text-gray-700');
        } else {
            previewContent.innerHTML = 'La vista previa aparecerá aquí mientras escribes...';
            previewContent.classList.add('text-gray-400', 'italic');
            previewContent.classList.remove('text-gray-700');
        }
    }
    
    // Contador de caracteres
    function actualizarContador() {
        if (!inputMessage || !charCount) return;
        
        const length = inputMessage.value.length;
        charCount.textContent = `${length}/1000 caracteres`;
        
        if (length > 800) {
            charCount.classList.add('text-red-500');
            charCount.classList.remove('text-gray-400');
        } else {
            charCount.classList.remove('text-red-500');
            charCount.classList.add('text-gray-400');
        }
    }
    
    if (inputMessage) {
        inputMessage.addEventListener('input', function() {
            actualizarVistaPrevia();
            actualizarContador();
        });
    }
    
    // Cargar plantillas de ejemplo si no hay plantillas guardadas
    const plantillasExistentes = window.templateStore.getPlantillas();
    if (plantillasExistentes.length === 0) {
        const ejemplo1 = new Template(
            'Mensaje de Bienvenida', 
            '¡Hola {nombre}! 👋\n\nBienvenido/a a {empresa}. Estamos emocionados de tenerte como parte de nuestra comunidad.\n\nSi tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!\n\nSaludos cordiales,\nEl equipo de {empresa}', 
            'bienvenida', 
            'nuevos-clientes', 
            'Sistema'
        );
        
        const ejemplo2 = new Template(
            'Seguimiento de Ventas', 
            'Hola {nombre}, 😊\n\nEspero que estés bien. Te contacto para hacer seguimiento a tu consulta sobre {producto}.\n\n¿Tienes alguna pregunta adicional? Me encantaría ayudarte a encontrar la mejor solución para tus necesidades.\n\n¡Quedo atento a tu respuesta!\n{vendedor}', 
            'ventas', 
            'seguimiento', 
            'Sistema'
        );
        
        const ejemplo3 = new Template(
            'Soporte Técnico', 
            'Hola {nombre}, 🔧\n\nHemos recibido tu consulta de soporte técnico sobre {issue}.\n\nNuestro equipo está trabajando en resolver tu problema. Te mantendremos informado sobre el progreso.\n\nTiempo estimado de resolución: {tiempo}\n\nGracias por tu paciencia.\nSoporte Técnico', 
            'soporte', 
            'tecnico', 
            'Sistema'
        );
        
        window.templateStore.agregarPlantilla(ejemplo1);
        window.templateStore.agregarPlantilla(ejemplo2);
        window.templateStore.agregarPlantilla(ejemplo3);
    }
    
    // Renderizar estado inicial
    renderPlantillas();
    actualizarEstadisticas();
    actualizarOpcionesHashtag();
    
    // Agregar event listeners después del renderizado inicial
    setTimeout(() => {
        agregarEventListeners();
    }, 100);
});

// Agregar event listeners después de cada renderizado
// Esta función debe llamarse después de renderPlantillas()
function initEventListenersAfterRender() {
    agregarEventListeners();
}

// Modificar renderPlantillas para incluir event listeners
const originalRenderPlantillas = renderPlantillas;
renderPlantillas = function() {
    originalRenderPlantillas();
    setTimeout(() => {
        agregarEventListeners();
    }, 50);
};