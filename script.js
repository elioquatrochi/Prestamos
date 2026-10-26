/**
 * Elton Préstamos - Script Principal, Slideshow de Fondo, Testimonios y Simulador Dinámico por Tramos
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
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
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

    // 5. Inicializar el Simulador Financiero con Tasas Dinámicas por Tramos
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

        // Reglas de negocio para tasas variables
        function obtenerTasaAutomatica(monto, cuotas) {
            if (monto >= 1200000) {
                if (cuotas >= 8) return 92; // 8 cuotas o más para montos altos
                return 90;
            } else if (monto >= 600000) {
                if (cuotas <= 3) return 78; // 3 cuotas -> 78%
                if (cuotas <= 5) return 85; // 5 cuotas -> 85%
                return 88;
            } else {
                if (cuotas <= 3) return 75;
                return 80;
            }
        }

        function actualizarSimulacionDinamica() {
            const monto = parseFloat(inputMonto.value) || 0;
            const cuotas = parseInt(inputCuotas.value, 10) || 1;
            
            const tasaCalculada = obtenerTasaAutomatica(monto, cuotas);
            inputTasa.value = tasaCalculada;

            actualizarMesFinal();
            renderSimuladorCliente(monto, tasaCalculada, cuotas);
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

function calcularSistemaFrances(monto, tasaPct, n){
    const i = tasaPct / 100;
    let cuota;
    if(i === 0) cuota = monto / n;
    else cuota = (monto * i) / (1 - Math.pow(1 + i, -n));
    
    let saldo = monto;
    const filas = [];
    for(let k = 1; k <= n; k++){
        const interes = saldo * i;
        let capital = cuota - interes;
        let saldoFinal = saldo - capital;
        if(k === n){ capital += saldoFinal; saldoFinal = 0; }
        filas.push({ numero: k, saldoInicial: saldo, capital: capital, cuota: interes + capital, saldoFinal: Math.max(0, saldoFinal) });
        saldo = saldoFinal;
    }
    return { cuotaFija: cuota, filas };
}

function renderSimuladorCliente(montoOverride, tasaOverride, cuotasOverride){
    const monto = montoOverride !== undefined ? montoOverride : (parseFloat(document.getElementById('monto').value) || 0);
    const tasa = tasaOverride !== undefined ? tasaOverride : (parseFloat(document.getElementById('tasa').value) || 85);
    const n = cuotasOverride !== undefined ? cuotasOverride : (parseInt(document.getElementById('cuotas').value, 10) || 1);
    
    const selMes = document.getElementById('mesInicio');
    if(!selMes) return;
    const mesInicioIdx = parseInt(selMes.value, 10);
    const anioInicio = parseInt(document.getElementById('anioInicio').value, 10) || new Date().getFullYear();
    const labels = etiquetasMeses(mesInicioIdx, anioInicio, n);

    if (monto <= 0 || n <= 0) return;

    const { cuotaFija, filas } = calcularSistemaFrances(monto, tasa, n);
    const totalPagado = filas.reduce((acc, f) => acc + f.cuota, 0);

    const summaryEl = document.getElementById('summary');
    if(summaryEl) {
        summaryEl.style.display = 'grid';
        summaryEl.innerHTML = `
            <div class="client-card">
                <div class="k">Monto Solicitado</div>
                <div class="v">${fmt(monto)}</div>
            </div>
            <div class="client-card" style="border-left-color: var(--primary-color);">
                <div class="k">Cuota Mensual Fija (${tasa}% Tasa)</div>
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
        let totalCuotasSum = 0;
        const filasHtml = filas.map((f, idx) => {
            totalCuotasSum += f.cuota;
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
                        <th>Cuota #</th><th>Mes de Vencimiento</th><th>Valor de Cuota</th><th>Saldo Pendiente</th>
                    </tr>
                </thead>
                <tbody>${filasHtml}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" class="mes">Total a abonar al finalizar el préstamo</td>
                        <td>${fmt(totalCuotasSum)}</td>
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
        estado.textContent = `Simulación calculada al ${tasa}% mensual con éxito.`;
    }
}