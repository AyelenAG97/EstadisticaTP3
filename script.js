let users = [];

// Datos crudos de cada endpoint (para que ambos podamos usarlos en los graficos)
let asistenciaData = [];
let historialAsistenciaData = [];
let calificacionesData = [];
let comunicadosData = [];

const estudiantes = "https://apidemo.geoeducacion.com.ar/api/testing/estudiantes/1"
const asistencia = "https://apidemo.geoeducacion.com.ar/api/testing/asistencia/1"
const his_asistencia = "https://apidemo.geoeducacion.com.ar/api/testing/historial_asistencia/1"
const calificaciones = "https://apidemo.geoeducacion.com.ar/api/testing/calificaciones/1"
const comunicados = "https://apidemo.geoeducacion.com.ar/api/testing/comunicados/1"

let chartComposicionNiveles, chartAsistenciaGeneral, chartComparacionCursos, chartEvolucionMensual;

async function fetchData() {
    try {
        const [resEst, resAsis, resHist, resCal, resCom] = await Promise.all([
            fetch(estudiantes),
            fetch(asistencia),
            fetch(his_asistencia),
            fetch(calificaciones),
            fetch(comunicados)
        ]);

        if (!resEst.ok || !resAsis.ok || !resHist.ok || !resCal.ok || !resCom.ok) {
            throw new Error("Ocurrio un error al obtener los datos de la API.");
        }

        const [dataEst, dataAsis, dataHist, dataCal, dataCom] = await Promise.all([
            resEst.json(),
            resAsis.json(),
            resHist.json(),
            resCal.json(),
            resCom.json()
        ]);

        users = dataEst.data;
        asistenciaData = dataAsis.data;
        historialAsistenciaData = dataHist.data;
        calificacionesData = dataCal.data;
        comunicadosData = dataCom.data;

        console.log({ users, asistenciaData, historialAsistenciaData, calificacionesData, comunicadosData });

        renderTable();
        renderFrecuenciaNiveles();
        renderFrecuenciaCursos();


        renderGraficoComposicionNiveles();
        renderGraficoAsistenciaGeneral();
        renderGraficoComparacionAsistenciaCursos();
        renderGraficoEvolucionAsistenciaMensual();

    } catch (error) {
        console.error(error);
    }

}

function renderTable() {
    const tbody = document.querySelector("#tablaUsuarios tbody");
    tbody.innerHTML = "";

    users.forEach((user) => {
        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${user.nombre}</td>
        <td>${user.apellido}</td>
        <td>${user.curso}</td>
        <td>${user.nivel}</td>
        `;

        tbody.appendChild(row);
    })

}

function renderFrecuenciaNiveles() {

    const tbody = document.getElementById("nivelesTabla");

    tbody.innerHTML = "";

    let frecuencias = {};

    users.forEach((user) => {

        let nivel = user.nivel;

        if (frecuencias[nivel]) {
            frecuencias[nivel]++;
        } else {
            frecuencias[nivel] = 1;
        }

    });

    let acumulada = 0;

    let total = users.length;

    for (let nivel in frecuencias) {

        let absoluta = frecuencias[nivel];

        acumulada += absoluta;

        let relativa = ((absoluta / total) * 100).toFixed(2);

        tbody.innerHTML += `
            <tr>
                <td>${nivel}</td>
                <td>${absoluta}</td>
                <td>${acumulada}</td>
                <td>${relativa}%</td>
            </tr>
        `;

    }

}

function renderFrecuenciaCursos() {

    const tbody = document.getElementById("tablaCursos");

    tbody.innerHTML = "";

    let frecuencias = {};

    users.forEach((user) => {

        let curso = user.curso;

        if (frecuencias[curso]) {
            frecuencias[curso]++;
        } else {
            frecuencias[curso] = 1;
        }

    });

    let acumulada = 0;

    let total = users.length;

    for (let curso in frecuencias) {

        let absoluta = frecuencias[curso];

        acumulada += absoluta;

        let relativa = ((absoluta / total) * 100).toFixed(2);

        tbody.innerHTML += `
            <tr>
                <td>${curso}</td>
                <td>${absoluta}</td>
                <td>${acumulada}</td>
                <td>${relativa}%</td>
            </tr>
        `;

    }
}


// GRAFICOS //

function renderGraficoComposicionNiveles() {
    let frecuencias = {};

    users.forEach((user) => {
        let nivel = user.nivel;
        if (frecuencias[nivel]) {
            frecuencias[nivel]++;
        } else {
            frecuencias[nivel] = 1;
        }
    });

    const labels = Object.keys(frecuencias);
    const valores = Object.values(frecuencias);

    const ctx = document.getElementById("graficoComposicionNiveles");
    if (!ctx) return;

    if (chartComposicionNiveles) chartComposicionNiveles.destroy();

    chartComposicionNiveles = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                label: "Alumnos por nivel",
                data: valores,
                backgroundColor: ["#1e88e5", "#fb8c00", "#8e24aa", "#43a047"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Composicion del alumnado por nivel" }
            }
        }
    });
}

function renderGraficoAsistenciaGeneral() {
    let totalPresentes = 0;
    let totalAusentes = 0;

    asistenciaData.forEach((registro) => {
        totalPresentes += registro.presentes;
        totalAusentes += registro.ausentes;
    });

    const ctx = document.getElementById("graficoAsistenciaGeneral");
    if (!ctx) return;

    if (chartAsistenciaGeneral) chartAsistenciaGeneral.destroy();

    chartAsistenciaGeneral = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Presentes", "Ausentes"],
            datasets: [{
                label: "Cantidad de alumnos",
                data: [totalPresentes, totalAusentes],
                backgroundColor: ["#4caf50", "#e53935"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Nivel de asistencia general" },
                legend: { display: false }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}
function renderGraficoComparacionAsistenciaCursos() {
    const labels = asistenciaData.map((registro) => registro.curso);
    const presentes = asistenciaData.map((registro) => registro.presentes);
    const ausentes = asistenciaData.map((registro) => registro.ausentes);

    const ctx = document.getElementById("graficoComparacionCursos");
    if (!ctx) return;

    if (chartComparacionCursos) chartComparacionCursos.destroy();

    chartComparacionCursos = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Presentes",
                    data: presentes,
                    backgroundColor: "#4caf50",
                },
                {
                    label: "Ausentes",
                    data: ausentes,
                    backgroundColor: "#e53935",
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Comparacion de niveles de asistencia por curso" }
            },
            scales: {
                x: {
                    stacked: true, 
                },
                y: {
                    stacked: true, 
                    beginAtZero: true
                }
            }
        }
    });
}
function renderGraficoEvolucionAsistenciaMensual() {
    const labels = historialAsistenciaData.map((registro) => registro.mes);
    const valores = historialAsistenciaData.map((registro) => (registro.asistencia * 100).toFixed(2));

    const ctx = document.getElementById("graficoEvolucionMensual");
    if (!ctx) return;

    if (chartEvolucionMensual) chartEvolucionMensual.destroy();

    chartEvolucionMensual = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "% de asistencia",
                data: valores,
                borderColor: "#1e88e5",
                backgroundColor: "rgba(30, 136, 229, 0.2)",
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Evolucion anual de nivel de asistencia por mes" }
            },
            scales: { y: { min: 0, max: 100 } }
        }
    });
}

fetchData();