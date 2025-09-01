# 🎯 NPS Widget Designer

> **Plataforma SaaS completa para crear y embeber widgets de encuestas NPS personalizables**

Una herramienta visual e intuitiva que permite diseñar encuestas Net Promoter Score (NPS) con funcionalidad drag-and-drop y generar código embebible para cualquier sitio web.

![NPS Widget Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Características Principales

### 🎨 **Designer Visual**

- **Layout con 3 paneles**: Sidebar izquierdo (elementos), Canvas central (diseño), Sidebar derecho (propiedades)
- **Drag & Drop**: Arrastra elementos desde la librería al canvas
- **Redimensionamiento**: Ajusta tamaño de elementos visualmente
- **Propiedades en tiempo real**: Modifica colores, textos, dimensiones al instante

### 🧩 **Elementos Disponibles**

- **NPS Scale**: Escalas 0-10 con etiquetas personalizables
- **Text Input**: Campos de texto con validación
- **Textarea**: Áreas de texto multilinea
- **Select Dropdown**: Listas desplegables con opciones
- **Heading**: Títulos de diferentes niveles (H1-H6)
- **Text Block**: Bloques de texto descriptivo

### 🔧 **Personalización Avanzada**

- **Estilos visuales**: Colores, fuentes, bordes, sombras
- **Validación**: Campos requeridos y opcionales
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Temas**: Sistema de colores personalizables

### 📡 **Integración y Webhooks**

- **Endpoints configurables**: Envío de datos a cualquier URL
- **Headers personalizados**: Autenticación y metadata
- **Métodos HTTP**: POST, PUT, PATCH soportados
- **Manejo de errores**: Mensajes de éxito y error customizables

### 📦 **Sistema de Exportación**

#### 🎯 **Tres Versiones de Código**

1. **📋 Full Script** (~15KB)

   - Código completo con todas las características
   - Ideal para desarrollo y testing
   - Incluye logging detallado

2. **⚡ Compact Script** (~2KB)

   - Versión minificada y optimizada
   - 85% menor tamaño que la versión completa
   - Perfecto para producción

3. **🌐 HTML Static**
   - Página HTML completa standalone
   - No requiere hosting externo
   - Lista para desplegar

## 🚀 Inicio Rápido

### Prerequisitos

- **Node.js** 20+
- **pnpm** (recomendado) o npm
- Navegador moderno con soporte ES6+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/nps-widget.git
cd nps-widget

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev
```

Visita `http://localhost:3000` para ver el designer en acción.

### Build para Producción

```bash
# Generar build optimizado
pnpm build

# Iniciar servidor de producción
pnpm start
```

## 📖 Guía de Uso

### 1. **Diseñar tu Encuesta**

1. **Arrastra elementos** desde el sidebar izquierdo al canvas central
2. **Configura propiedades** en el sidebar derecho (colores, textos, dimensiones)
3. **Previsualiza** usando el modo preview
4. **Ajusta estilos** globales en la configuración del formulario

### 2. **Configurar Webhooks**

```javascript
// Ejemplo de configuración
{
  "submitEndpoint": "https://api.miapp.com/nps-survey",
  "submitMethod": "POST",
  "webhookHeaders": {
    "Authorization": "Bearer tu-token-aqui",
    "X-API-Key": "tu-api-key"
  },
  "successMessage": "¡Gracias por tu feedback!",
  "errorMessage": "Error al enviar. Intenta de nuevo."
}
```

### 3. **Exportar y Embeber**

#### Opción A: Script Compacto (Recomendado)

```html
<!-- Solo 2KB - Perfecto para producción -->
<div id="nps-nps-survey-123"></div>
<script>
  // Script ultra-minificado aquí
</script>
```

#### Opción B: Script Completo (Desarrollo)

```html
<!-- Script completo con debugging -->
<div id="nps-widget-nps-survey-123"></div>
<script src="nps-widget-full.js"></script>
```

#### Opción C: HTML Estático

```html
<!-- Página completa standalone -->
<!DOCTYPE html>
<html>
  <!-- Widget integrado -->
</html>
```

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Framework**: Next.js 15.5.2 con React 19
- **UI**: Tailwind CSS 4 + Lucide Icons
- **Drag & Drop**: @dnd-kit/core
- **TypeScript**: Tipado estricto completo
- **Package Manager**: pnpm

### Estructura del Proyecto

```
nps-widget/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página inicial
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   └── designer/          # Componentes del designer
│   │       ├── FormDesigner.tsx      # Orchestrador principal
│   │       ├── Canvas.tsx            # Área de diseño
│   │       ├── LeftSidebar.tsx       # Librería de elementos
│   │       ├── RightSidebar.tsx      # Panel de propiedades
│   │       ├── ElementRenderer.tsx   # Renderizado de elementos
│   │       ├── ResizableWrapper.tsx  # Redimensionamiento
│   │       ├── PreviewMode.tsx       # Vista previa
│   │       ├── FormSettings.tsx      # Configuración webhooks
│   │       └── CodeExport.tsx        # Exportación de código
│   └── types/
│       └── form-elements.ts   # Tipos TypeScript
├── public/                    # Assets estáticos
├── test-widget.html          # Ambiente de pruebas
└── docs/                     # Documentación adicional
```

## 🧪 Testing

### Ambiente de Pruebas

El archivo `test-widget.html` proporciona un ambiente completo de testing:

```bash
# Abrir en navegador
open test-widget.html

# O servir con servidor local
python3 -m http.server 8000
# Visitar: http://localhost:8000/test-widget.html
```

### Características del Test Environment

- ✅ **Modal de control** para reiniciar pruebas
- ✅ **Console logging** detallado para debugging
- ✅ **Error handling** robusto con mensajes informativos
- ✅ **Script compacto** integrado para validación de producción

## 🔗 API y Webhooks

### Estructura de Datos de Respuesta

```json
{
  "timestamp": "2025-09-01T10:30:00.000Z",
  "formId": "nps-survey-1234567890",
  "responses": {
    "nps-question-1": "8",
    "feedback-text": "Excelente servicio",
    "recommendation": "Sí, definitivamente"
  },
  "userAgent": "Mozilla/5.0...",
  "pageUrl": "https://miapp.com/checkout"
}
```

### Endpoints de Testing

- **httpbin.org**: `https://httpbin.org/post` (sin CORS)
- **webhook.site**: `https://webhook.site/uuid` (con CORS configurado)
- **Desarrollo local**: `http://localhost:3000/api/webhook`

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Deploy automático con Git
npx vercel --prod
```

### Netlify

```bash
# Build command: pnpm build
# Publish directory: .next
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 🤝 Contribuir

### Proceso de Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commitea** tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### Areas de Mejora

- [ ] **Temas adicionales**: Dark mode, más paletas de colores
- [ ] **Elementos nuevos**: Rating stars, checkboxes, radio groups
- [ ] **Analytics**: Dashboard de métricas integrado
- [ ] **A/B Testing**: Comparación de versiones de encuestas
- [ ] **Templates**: Plantillas predefinidas por industria
- [ ] **Multi-idioma**: Soporte para múltiples lenguajes

## 📝 Changelog

### v1.0.0 (Septiembre 2025)

- ✅ Designer visual completo con drag & drop
- ✅ Sistema de exportación de 3 niveles
- ✅ Configuración de webhooks y endpoints
- ✅ Ambiente de testing integrado
- ✅ Elementos: NPS, inputs, textarea, select, headings, text
- ✅ Personalización de estilos y colores
- ✅ Modo preview y edición
- ✅ Redimensionamiento visual de elementos

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🙋‍♂️ Soporte

### Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/nps-widget/issues)
- **Email**: soporte@miapp.com

---

## 🎯 Demo en Vivo

**Test Widget**: Abre `test-widget.html` en tu navegador para ver un widget funcionando

---

<div align="center">

**🚀 ¡Construido con Next.js 15, React 19 y mucho ❤️!**

[⭐ Star](https://github.com/tu-usuario/nps-widget) · [🐛 Report Bug](https://github.com/tu-usuario/nps-widget/issues) · [✨ Request Feature](https://github.com/tu-usuario/nps-widget/issues)

</div>
# nps-widget
