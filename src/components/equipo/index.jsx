import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react'
import './style.css'

function Equipo() {
    const { id } = useParams();
    const [dataequipo, setDataequipo] = useState(null);
    const [favoritos, setFavoritos] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('favoritosEquipos') || '[]');
        } catch {
            return [];
        }
    });
    const esFavorito = dataequipo
        ? favoritos.some(e => e.id === dataequipo.teamInfoId)
        : false;

    useEffect(() => {
        fetch('https://api.openligadb.de/getbltable/bl1/2025')
            .then(response => response.json())
            .then(responseData => {
                const tabla = responseData ?? [];
                const indice = tabla.findIndex(e => e.teamInfoId === Number(id));
                if (indice === -1) {
                    setDataequipo(null);
                    return;
                }
                // La API devuelve la tabla ordenada: la posición es el índice + 1
                setDataequipo({ ...tabla[indice], posicion: indice + 1 });
            })
            .catch(error => console.error("Error:", error));
    }, [id]);

    const toggleFavorito = () => {
        let nuevosFavoritos;
        if (esFavorito) {
            nuevosFavoritos = favoritos.filter(e => e.id !== dataequipo.teamInfoId);
        } else {
            nuevosFavoritos = [
                ...favoritos,
                {
                    id: dataequipo.teamInfoId,
                    nombre: dataequipo.teamName,
                    icono: dataequipo.teamIconUrl
                }
            ];
        }
        setFavoritos(nuevosFavoritos);
        localStorage.setItem('favoritosEquipos', JSON.stringify(nuevosFavoritos));
    };

    if (!dataequipo || !dataequipo.teamInfoId) return <p>Cargando...</p>;
    return (
        <div className="c-detalle">
            <h1>{dataequipo.teamName}</h1>
            <img
                src={dataequipo.teamIconUrl}
                alt={dataequipo.teamName}
                width="200"
            />

            <p>Posición: {dataequipo.posicion}</p>
            <p>Puntos: {dataequipo.points} / Partidos: {dataequipo.matches}</p>

            <p>Ganados: {dataequipo.won}</p>
            <p>Empatados: {dataequipo.draw}</p>
            <p>Perdidos: {dataequipo.lost}</p>
            <p>Goles a favor: {dataequipo.goals} Goles en contra: {dataequipo.opponentGoals}</p>
            <p>Diferencia de goles: {dataequipo.goalDiff}</p>

            <button onClick={toggleFavorito}>
                {esFavorito ? '❤️' : '🤍'}
            </button>
        </div>
    )
}

export default Equipo