// Configuración de la API
const API_BASE_URL = "http://localhost:4000/api/";
const ENDPOINTS = {
  listar: "/categoria/listartodos",
  crear: "/categoria/nuevo",
  borrar: "/categoria/borrarporid",
  editar: "/categoria/editarporid",
};

// Variables globales
let categorias = [];
const modal = new bootstrap.Modal(document.getElementById("editarModal"));

// Función para obtener todas las categorías
async function obtenerCategorias() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.listar}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    categorias = await response.json();
    console.log(categorias);
    mostrarCategorias();
  } catch (error) {
    console.error("Error al obtener categorías:", error.message);
    alert("Error al cargar las categorías");
  }
}

// Función para mostrar las categorías en la tabla
function mostrarCategorias() {
  const tbody = document.getElementById("tablaCategorias");
  tbody.innerHTML = "";

  categorias.listaCategorias.forEach((categoria) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${categoria._id}</td>
      <td>${categoria.nombre}</td>
      <td>${categoria.descripcion}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" onclick="editarCategoria('${categoria._id}')">
          Editar
        </button>
        <button class="btn btn-sm btn-danger" onclick="eliminarCategoria('${categoria._id}')">
          Eliminar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para crear una nueva categoría
async function crearCategoria(nombre, descripcion) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.crear}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    await obtenerCategorias();
    return true;
  } catch (error) {
    console.error("Error al crear categoría:", error.message);
    alert("Error al crear la categoría");
    return false;
  }
}

// Función para eliminar una categoría
async function eliminarCategoria(id) {
  if (!confirm("¿Está seguro de eliminar esta categoría?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.borrar}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    await obtenerCategorias();
    alert("Categoría eliminada con éxito");
  } catch (error) {
    console.error("Error al eliminar categoría:", error.message);
    alert("Error al eliminar la categoría");
  }
}

// Función para preparar la edición de una categoría
function editarCategoria(id) {
  const categoria = categorias.listaCategorias.find((cat) => cat._id === id);
  if (categoria) {
    document.getElementById("editarId").value = categoria._id;
    document.getElementById("editarNombre").value = categoria.nombre;
    document.getElementById("editarDescripcion").value = categoria.descripcion;
    modal.show();
  }
}

// Función para guardar la edición de una categoría
async function guardarEdicion(id, nombre, descripcion) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.editar}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, descripcion }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    await obtenerCategorias();
    modal.hide();
    return true;
  } catch (error) {
    console.error("Error al editar categoría:", error.message);
    alert("Error al editar la categoría");
    return false;
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("isAdmin")) {
// Cargar categorías al iniciar
obtenerCategorias();

// Manejar el formulario de nueva categoría
document
  .getElementById("formCategoria")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreCategoria").value.trim();
    const descripcion = document
      .getElementById("descripcionCategoria")
      .value.trim();
    if (await crearCategoria(nombre, descripcion)) {
      e.target.reset();
    }
  });

// Manejar el guardado de edición
document
  .getElementById("btnGuardarEdicion")
  .addEventListener("click", async () => {
    const id = document.getElementById("editarId").value;
    const nombre = document.getElementById("editarNombre").value.trim();
    const descripcion = document
      .getElementById("editarDescripcion")
      .value.trim();
    await guardarEdicion(id, nombre, descripcion);
  });
  } else {
    alert("No tienes permisos para acceder a esta página");
    window.location.href = "login.html";
  }
  
});
