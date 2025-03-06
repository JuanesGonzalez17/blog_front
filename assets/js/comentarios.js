// Configuración de la API
const API_CONFIG2 = {
  BASE_URL: "http://localhost:4000/api",
  ENDPOINTS: {
    listarComentarios: "/comentario/listartodos",
    nuevoComentario: "/comentario/nuevo",
    borrarComentario: "/comentario/borrarporid",
    editarComentario: "/comentario/editarporid",
    buscarComentario: "/comentario/buscarporid",
  },
};

class GestionComentarios {
  constructor() {
    this.comentarios = new Map(); // Cache de comentarios por entrada
    this.inicializarEventos();
  }

  inicializarEventos() {
    // Delegación de eventos para manejar múltiples formularios de comentarios
    document.addEventListener("submit", (e) => {
      if (e.target.matches(".form-comentario")) {
        e.preventDefault();
        this.manejarNuevoComentario(e.target);
      }
    });

    // Delegación para botones de editar y eliminar
    document.addEventListener("click", (e) => {
      if (e.target.matches(".btn-editar-comentario")) {
        this.mostrarFormularioEdicion(e.target.dataset.comentarioId);
      } else if (e.target.matches(".btn-eliminar-comentario")) {
        this.eliminarComentario(e.target.dataset.comentarioId);
      }
    });
  }

  // Crear el formulario de comentarios para una entrada específica
  crearFormularioComentario(entradaId) {
    return `
        <div class="card mb-3">
          <div class="card-body">
            <h6 class="card-subtitle mb-3">Agregar comentario</h6>
            <form class="form-comentario">
              <input type="hidden" name="entrada_id" value="${entradaId}">
              <input type="hidden" name="usuario_id" value="${this.obtenerUsuarioActual()}">
              <div class="mb-3">
                <textarea class="form-control" name="detalle" rows="2" required 
                  placeholder="Escribe tu comentario..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Comentar</button>
            </form>
          </div>
        </div>
      `;
  }

  // Obtener el ID del usuario actual (deberías implementar tu lógica de autenticación)
  obtenerUsuarioActual() {
    // Ejemplo: obtener de localStorage o de tu sistema de autenticación
    return sessionStorage.getItem("userId") || "";
  }

  // Cargar comentarios de una entrada
  async cargarComentarios(entradaId) {
    try {
      const response = await fetch(
        `${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.listarComentarios}`
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const comentarios = await response.json();
      console.log(comentarios);
      // Filtrar comentarios por entrada_id si la API no lo hace
      const comentariosEntrada = comentarios.listaComentarios.filter(
        (c) => c.entrada_id === entradaId
      );

      this.comentarios.set(entradaId, comentariosEntrada);
      this.mostrarComentarios(entradaId);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      this.mostrarMensaje("Error al cargar los comentarios", true);
    }
  }

  // Mostrar comentarios de una entrada
  mostrarComentarios(entradaId) {
    const contenedor = document.querySelector(`#comentarios-${entradaId}`);
    if (!contenedor) return;

    const comentariosEntrada = this.comentarios.get(entradaId) || [];
    console.log(comentariosEntrada);
    contenedor.innerHTML = `
        ${this.crearFormularioComentario(entradaId)}
        <div class="comentarios-lista">
          ${comentariosEntrada
            .map((comentario) => this.renderizarComentario(comentario))
            .join("")}
        </div>
      `;
  }

  // Renderizar un comentario individual
  renderizarComentario(comentario) {
    return `
        <div class="card mb-2" id="comentario-${comentario._id}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <p class="card-text mb-1">${comentario.detalle}</p>
              ${
                this.obtenerUsuarioActual() === comentario.usuario_id
                  ? `
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary btn-editar-comentario" 
                    data-comentario-id="${comentario._id}">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-eliminar-comentario" 
                    data-comentario-id="${comentario._id}">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              `
                  : ""
              }
            </div>
            <small class="text-muted">
              ${new Date(comentario.fecha).toLocaleDateString()}
            </small>
          </div>
        </div>
      `;
  }

  // Manejar nuevo comentario
  async manejarNuevoComentario(formulario) {
    try {
      const formData = new FormData(formulario);
      const datos = {
        entrada_id: formData.get("entrada_id"),
        usuario_id: formData.get("usuario_id"),
        detalle: formData.get("detalle"),
      };
      const response = await fetch(
        `${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.nuevoComentario}`,
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

      formulario.reset();
      await this.cargarComentarios(datos.entrada_id);
      this.mostrarMensaje("Comentario agregado con éxito");
    } catch (error) {
      console.error("Error al agregar comentario:", error);
      this.mostrarMensaje("Error al agregar el comentario", true);
    }
  }

  // Eliminar comentario
  async eliminarComentario(comentarioId) {
    if (!confirm("¿Está seguro de eliminar este comentario?")) return;

    try {
      const response = await fetch(
        `${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.borrarComentario}/${comentarioId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      document.getElementById(`comentario-${comentarioId}`).remove();
      this.mostrarMensaje("Comentario eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      this.mostrarMensaje("Error al eliminar el comentario", true);
    }
  }

  // Mostrar formulario de edición
  mostrarFormularioEdicion(comentarioId) {
    const comentarioElement = document.getElementById(
      `comentario-${comentarioId}`
    );
    const comentarioTexto =
      comentarioElement.querySelector(".card-text").textContent;

    comentarioElement.innerHTML = `
        <div class="card-body">
          <form class="form-editar-comentario">
            <div class="mb-2">
              <textarea class="form-control" required>${comentarioTexto}</textarea>
            </div>
            <div class="btn-group">
              <button type="submit" class="btn btn-primary btn-sm">Guardar</button>
              <button type="button" class="btn btn-secondary btn-sm" onclick="gestionComentarios.cancelarEdicion('${comentarioId}')">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      `;

    comentarioElement.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.actualizarComentario(
        comentarioId,
        e.target.querySelector("textarea").value
      );
    });
  }
// Agregar este método a la clase GestionComentarios
async cancelarEdicion(comentarioId) {
    try {
      // Obtener el comentario original
      const response = await fetch(`${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.buscarComentario}/${comentarioId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const comentario = await response.json();
      console.log(comentario);
      // Restaurar la vista original del comentario
      const elemento = document.getElementById(`comentario-${comentarioId}`);
      elemento.innerHTML = this.renderizarComentario(comentario.consulta);
    } catch (error) {
      console.error('Error al cancelar edición:', error);
      // Si falla la petición, al menos restauramos la vista del comentario
      const elemento = document.getElementById(`comentario-${comentarioId}`);
      elemento.innerHTML = `
        <div class="card-body">
          <p class="card-text mb-1">Error al cargar el comentario</p>
        </div>
      `;
    }
  }
  // Actualizar comentario
  async actualizarComentario(comentarioId, nuevoDetalle) {
    try {
      const response = await fetch(
        `${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.editarComentario}/${comentarioId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ detalle: nuevoDetalle }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const response2 = await fetch(`${API_CONFIG2.BASE_URL}${API_CONFIG2.ENDPOINTS.buscarComentario}/${comentarioId}`);
      
      if (!response2.ok) {
        throw new Error(`Error HTTP: ${response2.status}`);
      }
      const comentarioActualizado = await response2.json();
      const elemento = document.getElementById(`comentario-${comentarioId}`);
      elemento.innerHTML = this.renderizarComentario(comentarioActualizado.consulta);
      this.mostrarMensaje("Comentario actualizado con éxito");
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
      this.mostrarMensaje("Error al actualizar el comentario", true);
    }
  }

  // Mostrar mensajes al usuario
  mostrarMensaje(mensaje, esError = false) {
    alert(mensaje); // Puedes implementar una mejor UI para los mensajes
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  window.gestionComentarios = new GestionComentarios();
});
