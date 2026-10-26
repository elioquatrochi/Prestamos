const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Modo Oscuro / Claro
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            if (themeIcon) themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            localStorage.setItem('eltonTheme', isDark ? 'dark' : 'light');
        });

        if (localStorage.getItem('eltonTheme') === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
        }
    }

    // 2. Control del Menú Móvil
    const menuToggle = document.getElementById('menu-toggle');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.add('active'));
    }

    if (menuCloseBtn && navMenu) {
        menuCloseBtn.addEventListener('click', () => navMenu.classList.remove('active'));
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // 3. Simulador Financiero
    const selMes = document.getElementById('mesInicio');
    const inputMonto = document.getElementById('monto');
    const inputCuotas = document.getElementById('cuotas');
    const inputTasa = document.getElementById('tasa');

    if (selMes && inputMonto && inputCuotas && inputTasa) {
        MESES.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i; 
            opt.textContent = m;
            selMes.appendChild(opt);
        });
        selMes.value = new Date().getMonth();

       // Escala exacta de porcentajes confirmada por ti (Tope estricto de 10 cuotas):
        function obtenerTasaPorCuotas(cuotas) {
            if (cuotas <= 4) return 78;      // 1 a 3 cuotas -> 78%
            if (cuotas <= 5) return 85;      // 4 a 5 cuotas -> 85%
            if (cuotas <= 7) return 88;  
            if (cuotas == 8) return 92;         // 6 a 7 cuotas -> 88% (+3%)
            if (cuotas <= 9) return 93;
             if (cuotas == 10) return 95;         // 8 a 10 cuotas -> 93% (+1%)
            return 95;                       // Límite máximo
        }

        function actualizarSimulacionDinamica() {
            let cuotas = parseInt(inputCuotas.value, 10) || 1;
            if (cuotas > 10) { cuotas = 10; inputCuotas.value = 10; }
            if (cuotas < 1) { cuotas = 1; inputCuotas.value = 1; }

            const monto = parseFloat(inputMonto.value) || 0;
            const tasaCalculada = obtenerTasaPorCuotas(cuotas);
            inputTasa.value = tasaCalculada;

            renderSimuladorExacto(monto, tasaCalculada, cuotas);
        }

        ['input', 'change'].forEach(ev => {
            inputMonto.addEventListener(ev, actualizarSimulacionDinamica);
            inputCuotas.addEventListener(ev, actualizarSimulacionDinamica);
            selMes.addEventListener(ev, actualizarSimulacionDinamica);
        });

        actualizarSimulacionDinamica();
    }

    renderTestimonios();
});

function etiquetasMeses(mesInicioIdx, anioInicio, n){
    const out = [];
    for(let j=0; j < n; j++){
        const idx = (mesInicioIdx + j) % 12;
        const anio = anioInicio + Math.floor((mesInicioIdx + j) / 12);
        out.push(MESES[idx] + ' ' + anio);
    }
    return out;
}

const fmt = n => '$ ' + Math.round(n).toLocaleString('es-AR');

function calcularPrestamoExacto(monto, tasaPct, n){
    const tasaDecimal = tasaPct / 100;
    const totalDevolver = monto * (1 + tasaDecimal);
    const valorCuota = totalDevolver / n;
    
    const filas = [];
    let saldoPendiente = totalDevolver;
    
    for(let k = 1; k <= n; k++){
        saldoPendiente -= valorCuota;
        filas.push({ numero: k, cuota: valorCuota, saldoFinal: Math.max(0, saldoPendiente) });
    }
    
    return { cuotaFija: valorCuota, totalPagado: totalDevolver, filas };
}

function renderSimuladorExacto(montoOverride, tasaOverride, cuotasOverride){
    const monto = montoOverride !== undefined ? montoOverride : (parseFloat(document.getElementById('monto').value) || 0);
    const tasa = tasaOverride !== undefined ? tasaOverride : (parseFloat(document.getElementById('tasa').value) || 78);
    const n = cuotasOverride !== undefined ? cuotasOverride : (parseInt(document.getElementById('cuotas').value, 10) || 1);
    
    const selMes = document.getElementById('mesInicio');
    if(!selMes) return;
    const mesInicioIdx = parseInt(selMes.value, 10);
    const anioInicio = new Date().getFullYear();
    const labels = etiquetasMeses(mesInicioIdx, anioInicio, n);

    if (monto <= 0 || n <= 0) return;

    const { cuotaFija, totalPagado, filas } = calcularPrestamoExacto(monto, tasa, n);

    const summaryEl = document.getElementById('summary');
    if(summaryEl) {
        summaryEl.innerHTML = `
            <div class="client-card">
                <div class="k">Monto Solicitado</div>
                <div class="v">${fmt(monto)}</div>
            </div>
            <div class="client-card">
                <div class="k">Cuota Fija (${tasa}% Recargo)</div>
                <div class="v">${fmt(cuotaFija)}</div>
            </div>
            <div class="client-card" style="border-left-color: var(--accent-color);">
                <div class="k">Total a Devolver (${n} cuotas)</div>
                <div class="v">${fmt(totalPagado)}</div>
            </div>
        `;
    }

    const cont = document.getElementById('tablaContenedor');
    if(cont) {
        const filasHtml = filas.map((f, idx) => `
            <tr>
                <td>${f.numero}</td>
                <td class="mes">${labels[idx] || ''}</td>
                <td>${fmt(f.cuota)}</td>
                <td>${fmt(f.saldoFinal)}</td>
            </tr>
        `).join('');

        cont.innerHTML = `
            <table>
                <thead>
                    <tr><th>Cuota #</th><th>Mes de Vencimiento</th><th>Valor de Cuota</th><th>Saldo Total Restante</th></tr>
                </thead>
                <tbody>${filasHtml}</tbody>
                <tfoot>
                    <tr><td colspan="2" class="mes">Total a abonar al finalizar</td><td>${fmt(totalPagado)}</td><td>$ 0</td></tr>
                </tfoot>
            </table>
        `;
    }

    const btnWhatsapp = document.getElementById('btnEnviarWhatsappSimulacion');
    if (btnWhatsapp) {
        const mensaje = `Hola! Estaba simulando en la web y quiero solicitar este préstamo:%0A- Monto: $${Math.round(monto).toLocaleString()}%0A- Cuotas: ${n}%0A- Valor por Cuota: $${Math.round(cuotaFija).toLocaleString()}%0A- Total a devolver: $${Math.round(totalPagado).toLocaleString()}`;
        btnWhatsapp.href = `https://wa.me/5493510000000?text=${mensaje}`;
    }
}

// 4. Render de Testimonios con HTML Ordenado
let testimoniosData = JSON.parse(localStorage.getItem('eltonTestimonios')) || [
  { nombre: "Gonzalo M.", comentario: "Excelente atención por WhatsApp, me resolvieron todo rápido y sin vueltas.", puntaje: 5 },
  { nombre: "Mariela S.", comentario: "Muy claros los requisitos y la transferencia fue rápida a mi cuenta.", puntaje: 5 },
  { nombre: "Lucas P.", comentario: "Las cuotas son fijas y sin sorpresas. Proceso muy transparente.", puntaje: 4 }
];

let currentIndex = 0;

function renderTestimonios() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  
  track.innerHTML = testimoniosData.map(t => `
    <div class="carousel-card">
      <div class="carousel-card-header">
        <strong>${t.nombre}</strong>
        <span class="carousel-card-stars">${'⭐'.repeat(t.puntaje)}</span>
      </div>
      <p>"${t.comentario}"</p>
    </div>
  `).join('');
  
  actualizarCarruselPosicion();
}

function moverCarrusel(direccion) {
  const totalCards = testimoniosData.length;
  const cardsVisible = window.innerWidth > 768 ? 2 : 1;
  const maxIndex = Math.max(0, totalCards - cardsVisible);
  
  currentIndex += direccion;
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > maxIndex) currentIndex = maxIndex;
  
  actualizarCarruselPosicion();
}

function actualizarCarruselPosicion() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const card = track.querySelector('.carousel-card');
  if (!card) return;
  
  const cardWidth = card.offsetWidth;
  track.style.transform = `translateX(-${currentIndex * (cardWidth + 20)}px)`;
}

function agregarTestimonio(e) {
  e.preventDefault();
  const nombre = document.getElementById('tNombre').value.trim();
  const puntaje = parseInt(document.getElementById('tPuntaje').value);
  const comentario = document.getElementById('tComentario').value.trim();

  testimoniosData.unshift({ nombre, puntaje, comentario });
  localStorage.setItem('eltonTestimonios', JSON.stringify(testimoniosData));
  document.getElementById('formTestimonio').reset();
  currentIndex = 0;
  renderTestimonios();
}