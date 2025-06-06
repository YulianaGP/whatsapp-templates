// HU1: Crear clase Template
class Template {
    constructor(titulo, mensaje, hashtag, categoria, autor) {
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.hashtag = hashtag;
        this.categoria = categoria; // propiedad extra
        this.autor = autor;         // propiedad extra
        this.fechaCreacion = new Date(); // Añadimos fecha automática
    }

    // HU3: Método render - Estado Local
    render() {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition duration-300 hover:shadow-md template-card';
        
        div.innerHTML = `
            <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <div class="flex-1">
                    <div class="flex items-start justify-between mb-3">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-1">${this.titulo}</h3>
                            <div class="flex gap-2 mb-2">
                                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">#${this.hashtag}</span>
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">#${this.categoria}</span>
                            </div>
                        </div>
                        <div class="text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            ${this.formatearFecha()}
                        </div>
                    </div>
                    
                    <div class="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                        <p class="text-gray-700 text-sm leading-relaxed">
                            ${this.mensaje.replace(/\n/g, '<br>')}
                        </p>
                        <div class="mt-2 text-xs text-gray-500">
                            <i class="fas fa-user mr-1"></i>
                            Autor: ${this.autor}
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-row lg:flex-col gap-2 lg:ml-4">
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 flex items-center gap-2 text-sm copy-btn" data-titulo="${this.titulo}">
                        <i class="fas fa-copy"></i>
                        <span class="hidden sm:inline">Copiar</span>
                    </button>
                    <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2 text-sm edit-btn" data-titulo="${this.titulo}">
                        <i class="fas fa-edit"></i>
                        <span class="hidden sm:inline">Editar</span>
                    </button>
                    <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center gap-2 text-sm delete-btn" data-titulo="${this.titulo}">
                        <i class="fas fa-trash"></i>
                        <span class="hidden sm:inline">Eliminar</span>
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }

    // Método auxiliar para formatear fecha
    formatearFecha() {
        const ahora = new Date();
        const diff = ahora - this.fechaCreacion;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (dias === 0) return 'Creado hoy';
        if (dias === 1) return 'Creado hace 1 día';
        if (dias < 7) return `Creado hace ${dias} días`;
        if (dias < 30) return `Creado hace ${Math.floor(dias/7)} semana${Math.floor(dias/7) > 1 ? 's' : ''}`;
        return `Creado hace ${Math.floor(dias/30)} mes${Math.floor(dias/30) > 1 ? 'es' : ''}`;
    }

    // Método para obtener copia del texto para clipboard
    getTextoParaCopiar() {
        return `**${this.titulo}**\n\n${this.mensaje}\n\n#${this.hashtag} #${this.categoria}\n\nAutor: ${this.autor}`;
    }
}