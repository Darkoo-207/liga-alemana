import './style.css'

export default function Info() {
  return (
    <main className="pagina-info">
      <h1>Información</h1>
      <p>
        Consulta la clasificación de la Bundesliga 2025. Los datos de equipos,
        escudos y estadísticas se obtienen de OpenLigaDB.
      </p>
      <a href="https://api.openligadb.de/getbltable/bl1/2025">
        Ver la API de la tabla
      </a>
    </main>
  )
}
