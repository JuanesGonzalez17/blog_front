// Configuración de la API
const API_CONFIG = {
  BASE_URL: "http://localhost:4000/api",
  ENDPOINTS: {
    login: "/usuario/login",
  },
};

class LoginUsuario {
  constructor() {
    this.form = document.getElementById("formLogin");
    this.inicializarEventos();
  }

  inicializarEventos() {
    this.form.addEventListener("submit", (e) => this.manejarLogin(e));
  }

  // Validar el formato del email
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Validar las credenciales antes de enviar
  validarCredenciales() {
    const { email, clave } = this.campos;

    if (!this.validarEmail(email)) {
      throw new Error("El formato del email no es válido");
    }

    if (!clave) {
      throw new Error("La contraseña es obligatoria");
    }

    if (clave.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
  }

  // Enviar petición de login
  async enviarLogin(datos) {
    try {
      await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.isAdmin) {
            sessionStorage.setItem("userId", data.usuario);
            sessionStorage.setItem("isAdmin", data.isAdmin);
          } else {
            sessionStorage.setItem("userId", data.usuario);
          }
        });
    } catch (error) {
      throw new Error(`Error en el login: ${error.message}`);
    }
  }

  // Manejar la respuesta exitosa
  manejarLoginExitoso() {
    this.mostrarMensaje("Login exitoso");
    this.redirigirUsuario();
  }

  // Redirigir después del login
  redirigirUsuario() {
    // Aquí puedes redirigir al usuario a la página que corresponda
    window.location.href = "publicaciones.html";
  }

  // Sistema de notificaciones
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

  // Limpiar el formulario
  resetearFormulario() {
    this.form.reset();
  }

  // Manejar el proceso de login
  async manejarLogin(e) {
    e.preventDefault();
    this.campos = {
      email: document.getElementById("loginEmail").value,
      clave: document.getElementById("loginPassword").value,
    };
    try {
      // Validar credenciales
      this.validarCredenciales();

      await this.enviarLogin(this.campos);

      // Manejar respuesta exitosa
      this.manejarLoginExitoso();
      this.resetearFormulario();
    } catch (error) {
      this.mostrarMensaje(error.message, true);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new LoginUsuario();
});
