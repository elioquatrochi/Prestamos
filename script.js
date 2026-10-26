/**
 * Elton Préstamos - Script con Escala Exacta de Intereses y Cuotas
 */

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Slideshow Automático de Imágenes de Fondo
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // 2. Menú móvil
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    // 3. Carrusel Interactivo de Testimonios
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentTestimonial = 0;

    const showTestimonial = (index) => {
        testimonials.forEach((card, i) => card.classList.toggle('active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        currentTestimonial = index;
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => showTestimonial((currentTestimonial - 1 + testimonials.length) % testimonials.length));
        nextBtn.addEventListener('click', () => showTestimonial((currentTestimonial + 1) % testimonials.length));
        dots.forEach(dot => dot.addEventListener('click', (e) => showTestimonial(parseInt(e.target.dataset.index, 10))));
        setInterval(() => showTestimonial((currentTestimonial + 1) % testimonials.length), 6000);
    }

    // 4. Lógica de Acordeón
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isOpen = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-body').style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });

    // 5. Inicializar el Simulador Financiero con la Escala Exacta Ajustada
    const selMes = document.getElementById('mesInicio');
    const inputMonto = document.getElementById('monto');
    const inputCuotas = document.getElementById('cuotas');
    const inputTasa = document.getElementById('tasa');
    const inputAnio = document.getElementById('anioInicio');
    const btnCalcular = document.getElementById('btnCalcular');

    if (selMes && inputMonto && inputCuotas && inputTasa) {
        MESES.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i; 
            opt.textContent = m;
            selMes.appendChild(opt);
        });
        selMes.value = new Date().getMonth();

        // Escala exacta de porcentajes según las cuotas elegidas
        function obtenerTasaPorCuotas(cuotas) {
            if (cuotas <= 3) return 78;      // Hasta 3 cuotas -> 78%
            if (cuotas <= 5) return 85;      // 4 a 5 cuotas -> 85%
            if (cuotas <= 7) return 88;      // 6 a 7 cuotas -> 88% (+3%)
            if (cuotas <= 10) return 93;     // 8 a 10 cuotas -> 93% (+1%)
            return 95;                       // Más de 10 cuotas
        }

        function actualizarSimulacionDinamica() {
            const monto = parseFloat(inputMonto.value) || 0;
            const cuotas = parseInt(inputCuotas.value, 10) || 1;
            
            const tasaCalculada = obtenerTasaPorCuotas(cuotas);
            inputTasa.value = tasaCalculada;

            actualizarMesFinal();
            renderSimuladorEscalaExacta(monto, tasaCalculada, cuotas);
        }

        ['input', 'change'].forEach(ev => {
            inputMonto.addEventListener(ev, actualizarSimulacionDinamica);
            inputCuotas.addEventListener(ev, actualizarSimulacionDinamica);
            selMes.addEventListener(ev, actualizarMesFinal);
            if (inputAnio) inputAnio.addEventListener(ev, actualizarMesFinal);
        });

        if (btnCalcular) {
            btnCalcular.addEventListener('click', actualizarSimulacionDinamica);
        }

        actualizarSimulacionDinamica();
    }
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

function actualizarMesFinal(){
    const selMes = document.getElementById('mesInicio');
    if(!selMes) return;
    const mesInicioIdx = parseInt(selMes.value, 10);
    const anioInicio = parseInt(document.getElementById('anioInicio').value, 10) || new Date().getFullYear();
    const n = parseInt(document.getElementById('cuotas').value, 10) || 1;
    const labels = etiquetasMeses(mesInicioIdx, anioInicio, n);
    const mesFinalEl = document.getElementById('mesFinal');
    if(mesFinalEl) mesFinalEl.value = labels[labels.length - 1] || '';
}

const fmt = n => '$ ' + Math.round(n).toLocaleString('es-AR');

// CÁLCULO EXACTO: Total a devolver = Capital + Recargo de escala. Cuota = Total / Cuotas.
function calcularPrestamoEscalaExacta(monto, tasaPct, n){
    const tasaDecimal = tasaPct / 100;
    
    // Total a devolver directo según la tasa fija de la escala
    const totalDevolver = monto * (1 + tasaDecimal);
    
    // Cuota mensual fija dividida exactamente por las cuotas pedidas
    const valorCuota = totalDevolver / n;
    
    const filas = [];
    let saldoPendiente = totalDevolver;
    
    for(let k = 1; k <= n; k++){
        saldoPendiente -= valorCuota;
        filas.push({
            numero: k,
            cuota: valorCuota,
            saldoFinal: Math.max(0, saldoPendiente)
        });
    }
    
    return { cuotaFija: valorCuota, totalPagado: totalDevolver, filas };
}

function renderSimuladorEscalaExacta(montoOverride, tasaOverride, cuotasOverride){
    const monto = montoOverride !== undefined ? montoOverride : (parseFloat(document.getElementById('monto').value) || 0);
    const tasa = tasaOverride !== undefined ? tasaOverride : (parseFloat(document.getElementById('tasa').value) || 78);
    const n = cuotasOverride !== undefined ? cuotasOverride : (parseInt(document.getElementById('cuotas').value, 10) || 1);
    
    const selMes = document.getElementById('mesInicio');
    if(!selMes) return;
    const mesInicioIdx = parseInt(selMes.value, 10);
    const anioInicio = parseInt(document.getElementById('anioInicio').value, 10) || new Date().getFullYear();
    const labels = etiquetasMeses(mesInicioIdx, anioInicio, n);

    if (monto <= 0 || n <= 0) return;

    const { cuotaFija, totalPagado, filas } = calcularPrestamoEscalaExacta(monto, tasa, n);

    const summaryEl = document.getElementById('summary');
    if(summaryEl) {
        summaryEl.style.display = 'grid';
        summaryEl.innerHTML = `
            <div class="client-card">
                <div class="k">Monto Solicitado</div>
                <div class="v">${fmt(monto)}</div>
            </div>
            <div class="client-card" style="border-left-color: var(--primary-color);">
                <div class="k">Cuota Mensual Fija (${tasa}% Recargo)</div>
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
        const filasHtml = filas.map((f, idx) => {
            return `<tr>
                <td>${f.numero}</td>
                <td class="mes">${labels[idx] || ''}</td>
                <td>${fmt(f.cuota)}</td>
                <td>${fmt(f.saldoFinal)}</td>
            </tr>`;
        }).join('');

        cont.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Cuota #</th><th>Mes de Vencimiento</th><th>Valor de Cuota</th><th>Saldo Total Restante</th>
                    </tr>
                </thead>
                <tbody>${filasHtml}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="mes">Total a abonar al finalizar el préstamo</td>
                        <td>${fmt(totalPagado)}</td>
                        <td>$ 0</td>
                    </tr>
                </tfoot>
            </table>
        `;
    }

    const estado = document.getElementById('estado');
    if(estado) {
        estado.className = 'ok';
        estado.style.color = '#2F6A46';
        estado.textContent = `Cálculo exacto aplicado (${tasa}% de recargo total en ${n} cuotas).`;
    }
}