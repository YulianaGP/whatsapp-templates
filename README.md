# Gestor de Plantillas WhatsApp

## Clase Template

```js
class Template {
  constructor(titulo, mensaje, hashtag, categoria, autor) { ... }
  render() { ... }
}
```

## Propiedades

- **titulo**: Título de la plantilla.  
- **mensaje**: Mensaje principal.  
- **hashtag**: Etiqueta temática.  
- **categoria**: Tipo de plantilla.  
- **autor**: Quien la creó.  

## Métodos

- **render()**: Devuelve un elemento HTML con la representación visual de la plantilla.

## Estado Global

- **plantillas[]**: Array que contiene todas las plantillas activas.  
- Las funciones **agregarPlantilla()** y **eliminarPlantilla()** modifican este estado.
