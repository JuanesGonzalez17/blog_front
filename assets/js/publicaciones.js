// Actualizar la configuración de la API
const API_CONFIG = {
  BASE_URL: "http://localhost:4000/api",
  ENDPOINTS: {
    nuevaEntrada: "/entrada/nuevo",
    editarEntrada: "/entrada/editarporid",
    borrarEntrada: "/entrada/borrarporid",
    categorias: "/categoria/listartodos",
    buscarEntrada: "/entrada/buscarporid",
    buscarCategoria: "/categoria/buscarporid",
  },
};

class GestionPublicaciones {
  constructor() {
    // Agregar nuevas propiedades
    this.modal = new bootstrap.Modal(
      document.getElementById("modalNuevaEntrada")
    );
    this.form = document.getElementById("formNuevaEntrada");
    this.modalEditar = new bootstrap.Modal(
      document.getElementById("modalEditarEntrada")
    );
    this.formEditar = document.getElementById("formEditarEntrada");
    this.campos = {
      titulo: document.getElementById("tituloEntrada"),
      categoria: document.getElementById("categoriaEntrada"),
      detalle: document.getElementById("detalleEntrada"),
    };
    this.camposEditar = {
      id: document.getElementById("editarEntradaId"),
      titulo: document.getElementById("editarTitulo"),
      categoria: document.getElementById("editarCategoria"),
      detalle: document.getElementById("editarDetalle"),
    };
    this.categorias = [];
    this.publicaciones = [];
    this.inicializarEventos();
    this.cargarCategorias();
    this.cargarPublicaciones();
  }

  inicializarEventos() {
    document
      .getElementById("btnGuardarEntrada")
      .addEventListener("click", () => this.manejarGuardarEntrada());

    // Agregar evento para guardar edición
    document
      .getElementById("btnGuardarEdicion")
      .addEventListener("click", () => this.manejarGuardarEdicion());
  }
  // Cargar categorías en el select
  async cargarCategorias() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.categorias}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      this.categorias = await response.json();
      this.actualizarSelectCategorias();
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      this.mostrarMensaje("Error al cargar las categorías", true);
    }
  }
  actualizarSelectCategorias() {
    const select = this.campos.categoria;
    const select2 = this.camposEditar.categoria;
    select.innerHTML = '<option value="">Seleccione una categoría</option>';
    select2.innerHTML = '<option value="">Seleccione una categoría</option>';

    this.categorias.listaCategorias.forEach((categoria) => {
      const option = document.createElement("option");
      const option2 = document.createElement("option");
      option.value = categoria._id;
      option.textContent = categoria.nombre;
      select.appendChild(option);
      option2.value = categoria._id;
      option2.textContent = categoria.nombre;
      select2.appendChild(option2);
    });
  }
  // Cargar publicaciones
  async cargarPublicaciones() {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/entrada/listartodos`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      this.publicaciones = await response.json();
      this.mostrarPublicaciones();
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
      this.mostrarMensaje("Error al cargar las publicaciones", true);
    }
  }

  // Mostrar publicaciones en la tabla
  mostrarPublicaciones() {
    const contenedor = document.getElementById("blogPublicaciones");
    contenedor.innerHTML = "";

    this.publicaciones.listaEntradas.forEach((publicacion) => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4 mb-4";
      console.log(this.obtenerNombreCategoria(publicacion.categoria_id));
      col.innerHTML = `
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <h5 class="card-title">${publicacion.titulo}</h5>
                <span class="badge bg-primary mb-2">${this.obtenerNombreCategoria(
                  publicacion.categoria_id
                ).then((result) => {
                  `${result}`;
                  console.log(result);
                })}</span>
                <p class="card-text">${this.formatearDetalle(
                  publicacion.detalle
                )}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">${this.formatearFecha(
                    publicacion.fecha
                  )}</small>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-warning" onclick="gestionPublicaciones.editarPublicacion('${
                      publicacion._id
                    }')">
                      <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="gestionPublicaciones.eliminarPublicacion('|${
                      publicacion._id
                    }')">
                      <i class="bi bi-trash"></i> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
      contenedor.appendChild(col);
    });
  }
  // Método para formatear el detalle
  formatearDetalle(detalle) {
    // Limitar el detalle a 150 caracteres y agregar puntos suspensivos
    return detalle.length > 150 ? detalle.substring(0, 150) + "..." : detalle;
  }

  // Método para formatear la fecha
  formatearFecha(fecha) {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async obtenerNombreCategoria(categoriaId) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.buscarCategoria}/${categoriaId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const categoria = await response.json();
      return categoria.consulta.nombre;
    } catch (error) {
      console.error("Error al buscar la categoría:", error);
      return "Sin categoría";
    }
  }

  // Preparar edición de publicación
  async editarPublicacion(id) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.buscarEntrada}/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const publicacion = await response.json();

      if (publicacion) {
        this.camposEditar.id.value = publicacion.consulta._id;
        this.camposEditar.titulo.value = publicacion.consulta.titulo;
        this.camposEditar.categoria.value = publicacion.consulta.categoria_id;
        this.camposEditar.detalle.value = publicacion.consulta.detalle;
        this.modalEditar.show();
      } else {
        this.mostrarMensaje("No se encontró la publicación", true);
      }
    } catch (error) {
      console.error("Error al buscar la publicación:", error);
      this.mostrarMensaje("Error al cargar la publicación para editar", true);
    }
  }
  // Validar el formulario
  validarFormulario() {
    const { titulo, categoria, detalle } = this.campos;

    if (!titulo.value.trim()) {
      throw new Error("El título es obligatorio");
    }

    if (!categoria.value) {
      throw new Error("Debe seleccionar una categoría");
    }

    if (!detalle.value.trim()) {
      throw new Error("El detalle es obligatorio");
    }
  }
  // Validar formulario de edición
  validarFormularioEdicion() {
    const { titulo, categoria, detalle } = this.camposEditar;

    if (!titulo.value.trim()) {
      throw new Error("El título es obligatorio");
    }

    if (!categoria.value) {
      throw new Error("Debe seleccionar una categoría");
    }

    if (!detalle.value.trim()) {
      throw new Error("El detalle es obligatorio");
    }
  }
  // Preparar datos para enviar
  prepararDatosEntrada() {
    return {
      id: this.camposEditar.id.value,
      titulo: this.campos.titulo.value.trim(),
      categoria_id: this.campos.categoria.value,
      detalle: this.campos.detalle.value.trim(),
      imagen: "image.jpg",
    };
  }
  async enviarEntrada(datos) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.nuevaEntrada}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al crear la entrada: ${error.message}`);
    }
  }
  // Enviar edición al servidor
  async enviarEdicion(datos) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.editarEntrada}/${datos.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datos),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al editar la entrada: ${error.message}`);
    }
  }

  // Manejar guardado de edición
  async manejarGuardarEdicion() {
    try {
      this.validarFormularioEdicion();

      const datos = {
        id: this.camposEditar.id.value,
        titulo: this.camposEditar.titulo.value.trim(),
        categoria_id: this.camposEditar.categoria.value,
        detalle: this.camposEditar.detalle.value.trim(),
        imagen: "image.jpg",
      };

      await this.enviarEdicion(datos);
      this.mostrarMensaje("Publicación actualizada con éxito");
      this.modalEditar.hide();
      this.cargarPublicaciones();
    } catch (error) {
      this.mostrarMensaje(error.message, true);
    }
  }

  // Eliminar publicación
  async eliminarPublicacion(id) {
    if (!confirm("¿Está seguro de eliminar esta publicación?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.borrarEntrada}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      this.mostrarMensaje("Publicación eliminada con éxito");
      this.cargarPublicaciones();
    } catch (error) {
      this.mostrarMensaje(error.message, true);
    }
  }
  // Resetear el formulario
  resetearFormulario() {
    this.form.reset();
    this.modal.hide();
  }
  // Mostrar mensajes al usuario
  mostrarMensaje(mensaje, esError = false) {
    // Aquí podrías implementar un sistema de notificaciones más elaborado
    if (esError) {
      console.error(mensaje);
      alert(`Error: ${mensaje}`);
    } else {
      console.log(mensaje);
      alert(mensaje);
    }
  }
  // Manejar el guardado de la entrada
  async manejarGuardarEntrada() {
    try {
      // Validar formulario
      this.validarFormulario();

      // Preparar y enviar datos
      const datos = this.prepararDatosEntrada();
      const respuesta = await this.enviarEntrada(datos);

      // Manejar respuesta exitosa
      this.mostrarMensaje("Publicación creada con éxito");
      this.resetearFormulario();

      // Aquí podrías actualizar la lista de publicaciones si es necesario
      // this.actualizarListaPublicaciones();
    } catch (error) {
      this.mostrarMensaje(error.message, true);
    }
  }
}

// Inicializar y hacer la instancia global para los botones
let gestionPublicaciones;

document.addEventListener("DOMContentLoaded", () => {
  gestionPublicaciones = new GestionPublicaciones();
});
