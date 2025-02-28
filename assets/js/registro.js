// Configuración de la API
const API_CONFIG = {
  BASE_URL: "http://localhost:4000/api",
  ENDPOINTS: {
    registro: "/usuario/nuevo",
  },
};

// Clase para manejar el registro de usuarios
class RegistroUsuario {
  constructor() {
    this.form = document.getElementById("formRegistro");
    this.inicializarEventos();
  }

  inicializarEventos() {
    this.form.addEventListener("submit", (e) => this.manejarEnvioFormulario(e));
    this.campos.telefono.addEventListener("input", (e) =>
      this.validarTelefono(e)
    );
  }

  // Validar el formato del email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validar el formato del teléfono
  validarTelefono(e) {
    e.target = e.target.replace(/[^0-9+]/g, "");
  }

  // Validar todos los campos del formulario
  validarFormulario() {
    const { nombre, email, passwordHash, fechaNace, telefono } = this.campos;
    console.log(this.campos);
    if (!nombre.trim()) {
      throw new Error("El nombre es obligatorio");
    }

    if (!this.validarEmail(email)) {
      throw new Error("El email no es válido");
    }

    if (passwordHash.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    if (!fechaNace) {
      throw new Error("La fecha de nacimiento es obligatoria");
    }

    if (!telefono.trim()) {
      throw new Error("El teléfono es obligatorio");
    }
  }

  // Enviar datos al servidor
  async enviarDatos(formData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.registro}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al enviar datos: ${error.message}`);
    }
  }

  // Mostrar mensajes al usuario
  mostrarMensaje(mensaje, esError = false) {
    // Aquí podrías implementar una mejor UI para los mensajes
    // Por ejemplo, usando toasts de Bootstrap o una librería de notificaciones
    if (esError) {
      console.error(mensaje);
      alert(`Error: ${mensaje}`);
    } else {
      console.log(mensaje);
      alert(mensaje);
    }
  }

  // Resetear el formulario
  resetearFormulario() {
    this.form.reset();
  }

  // Manejar el envío del formulario
  async manejarEnvioFormulario(e) {
    e.preventDefault();
    this.campos = {
      nombre: document.getElementById("nombre").value,
      email: document.getElementById("email").value,
      passwordHash: document.getElementById("password").value,
      fechaNace: document.getElementById("fechaNacimiento").value,
      telefono: document.getElementById("telefono").value,
      foto: "image.jpg",
    };
    try {
      // Validar formulario
      this.validarFormulario();

      // Preparar y enviar datos
      const respuesta = await this.enviarDatos(this.campos);

      // Manejar respuesta exitosa
      this.mostrarMensaje("Registro completado con éxito");
      this.resetearFormulario();

      return respuesta;
    } catch (error) {
      this.mostrarMensaje(error.message, true);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new RegistroUsuario();
});
