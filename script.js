/**
 * Elton Préstamos - Script Principal, Slideshow de Fondo, Testimonios y Simulador para Clientes (Tasa 85% fija)
 */

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Slideshow Automático de Imágenes de Fondo (100% Robusto)
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
        testimonials.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentTestimonial = index;
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            let index = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
            showTestimonial(index);
        });

        nextBtn.addEventListener('click', () => {
            let index = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(index);
        });

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index, 10);
                showTestimonial(index);
            });
        });

        setInterval(() => {
            let index = (currentTestimonial + 1) % testimonials.length;
            showTestimonial(index);
        }, 6000);
    }

    // 4. Lógica de Acordeón
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
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

    // 5. Inicializar el Simulador Financiero Orientado al Cliente (simulador.html con Tasa 85% Fija)
    const selMes = document.getElementById('mesInicio');
    if (selMes) {
        MESES.forEach((m, i) => {
            const opt = document.createElement('option');
            opt.value = i; 
            opt.textContent = m;
            selMes.appendChild(opt);
        });
        selMes.value = new Date().getMonth();

        actualizarMesFinal();

        ['change', 'input'].forEach(ev => {
            selMes.addEventListener(ev, actualizarMesFinal);
            document.getElementById('anioInicio').addEventListener(ev, actualizarMesFinal);
            document.getElementById('cuotas').addEventListener(ev, actualizarMesFinal);
        });

        document.getElementById('btnCalcular').addEventListener('click', () => {
            renderSimuladorCliente();
        });

        // Ejecutar simulación por defecto al cargar
        renderSimuladorCliente();
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
    document.getElementById('mesFinal').value = labels[labels.length - 1] || '';
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

function renderSimuladorCliente(){
    const monto = parseFloat(document.getElementById('monto').value) || 0;
    const tasa = 85; // TASA FIJA OBLIGATORIA DEL 85%
    const n = parseInt(document.getElementById('cuotas').value, 10) || 0;
    const selMes = document.getElementById('mesInicio');
    const mesInicioIdx = parseInt(selMes.value, 10);
    const anioInicio = parseInt(document.getElementById('anioInicio').value, 10) || new Date().getFullYear();
    const labels = etiquetasMeses(mesInicioIdx, anioInicio, n);

    if (monto <= 0 || n <= 0) return;

    const { cuotaFija, filas } = calcularSistemaFrances(monto, tasa, n);
    const totalPagado = filas.reduce((acc, f) => acc + f.cuota, 0);

    // Mostrar tarjetas resumidas para el cliente
    const summaryEl = document.getElementById('summary');
    summaryEl.style.display = 'grid';
    summaryEl.innerHTML = `
        <div class="client-card">
            <div class="k">Monto Solicitado</div>
            <div class="v">${fmt(monto)}</div>
        </div>
        <div class="client-card" style="border-left-color: var(--primary-color);">
            <div class="k">Cuota Mensual Fija</div>
            <div class="v">${fmt(cuotaFija)}</div>
        </div>
        <div class="client-card" style="border-left-color: var(--accent-color);">
            <div class="k">Total a Devolver (${n} cuotas)</div>
            <div class="v">${fmt(totalPagado)}</div>
        </div>
    `;

    // Pintar tabla simplificada para el cliente
    const cont = document.getElementById('tablaContenedor');
    let totalCuotasSum = 0;

    const filasHtml = filas.map((f, idx) => {
        totalCuotasSum += f.cuota;
        return `<tr>
            <td>${f.numero}</td>
            <td class="mes">${labels[idx]}</td>
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

    const estado = document.getElementById('estado');
    estado.className = 'ok';
    estado.style.color = '#2F6A46';
    estado.textContent = 'Simulación calculada al 85% con éxito.';
}

let prestamos = JSON.parse(localStorage.getItem('sistemaPrestamosDineroData')) || [];

function guardarData() {
  localStorage.setItem('sistemaPrestamosDineroData', JSON.stringify(prestamos));
}

function showTab(tabId, ev) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  if (ev) ev.target.classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');
  renderAll();
}

// Ventana flotante de avisos (Popup propio)
function mostrarAlerta(titulo, texto, onConfirm = null) {
  document.getElementById('alertaTitulo').textContent = titulo;
  document.getElementById('alertaTexto').textContent = texto;
  const botonesDiv = document.getElementById('alertaBotones');
  botonesDiv.innerHTML = '';

  if (onConfirm) {
    const btnSi = document.createElement('button');
    btnSi.className = 'btn-action btn-saldar';
    btnSi.textContent = 'Sí, Confirmar';
    btnSi.onclick = () => {
      onConfirm();
      cerrarAlerta();
    };
    botonesDiv.appendChild(btnSi);

    const btnNo = document.createElement('button');
    btnNo.className = 'btn-backup';
    btnNo.textContent = 'Cancelar';
    btnNo.onclick = cerrarAlerta;
    botonesDiv.appendChild(btnNo);
  } else {
    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'btn-action';
    btnCerrar.textContent = 'Entendido';
    btnCerrar.onclick = cerrarAlerta;
    botonesDiv.appendChild(btnCerrar);
  }

  document.getElementById('modalAlerta').style.display = 'flex';
}

function cerrarAlerta() {
  document.getElementById('modalAlerta').style.display = 'none';
}

function registrarPrestamo(e) {
  e.preventDefault();
  const receptor = document.getElementById('p-receptor').value.trim();
  const monto = parseFloat(document.getElementById('p-monto').value);
  const cuotasTotales = parseInt(document.getElementById('p-cuotas').value);
  const documento = document.getElementById('p-documento').value;

  const fechaEmision = new Date().toLocaleDateString();

  // Inicializamos un arreglo booleano para el estado de cada cuota (false = pendiente, true = pagada)
  const cuotasArray = new Array(cuotasTotales).fill(false);

  prestamos.unshift({
    id: Date.now(),
    fechaEmision,
    fechaCierre: null,
    receptor,
    monto,
    cuotasTotales,
    cuotasArray, // Control detallado individual por cuota
    documento,
    saldado: false
  });

  guardarData();
  document.getElementById('form-prestamo').reset();
  document.getElementById('p-cuotas').value = "12";
  renderAll();
  mostrarAlerta("Éxito", `Préstamo registrado correctamente para ${receptor}.`);
}

// Abrir Modal de Control de Cuotas para seleccionar qué cuotas están pagas
function abrirControlCuotas(id) {
  const item = prestamos.find(p => p.id === id);
  if (!item) return;

  document.getElementById('modalTitle').textContent = `Cuotas de: ${item.receptor}`;
  const body = document.getElementById('modalCuotasBody');
  
  let html = `<p style="margin-bottom: 12px; font-size: 0.9rem; color: var(--text-muted);">Haz clic en una cuota para alternar entre <strong>Pagada</strong> y <strong>Pendiente</strong>:</p>`;
  html += `<div class="cuotas-grid">`;

  item.cuotasArray.forEach((pagada, idx) => {
    const numCuota = idx + 1;
    html += `<div class="cuota-pill ${pagada ? 'pagada' : ''}" onclick="toggleCuota(${item.id}, ${idx})">
      Cuota ${numCuota}<br>
      <span style="font-size: 0.75rem; font-weight: 700;">${pagada ? '✅ PAGADA' : '⏳ PENDIENTE'}</span>
    </div>`;
  });

  html += `</div>`;
  body.innerHTML = html;
  document.getElementById('modalCuotas').style.display = 'flex';
}

function cerrarModalCuotas() {
  document.getElementById('modalCuotas').style.display = 'none';
  renderAll();
}

// Cambiar estado individual de una cuota desde el modal
function toggleCuota(id, indexCuota) {
  const item = prestamos.find(p => p.id === id);
  if (!item) return;

  item.cuotasArray[indexCuota] = !item.cuotasArray[indexCuota];
  
  // Verificamos si se completaron todas las cuotas
  const todasPagas = item.cuotasArray.every(c => c === true);
  if (todasPagas) {
    item.saldado = true;
    item.fechaCierre = new Date().toLocaleDateString();
    guardarData();
    cerrarModalCuotas();
    mostrarAlerta("¡Crédito Saldado!", `Todas las cuotas de ${item.receptor} han sido abonadas. El crédito pasó automáticamente al historial.`);
    return;
  }

  guardarData();
  abrirControlCuotas(id); // Recarga el modal con los cambios actualizados
}

// Botón manual de Saldar Crédito completo
function saldarCreditoManual(id) {
  const item = prestamos.find(p => p.id === id);
  if (!item) return;

  mostrarAlerta(
    "Confirmar Saldado",
    `¿Desea dar por totalmente saldado el crédito de ${item.receptor} y devolver la garantía (${item.documento})?`,
    () => {
      // Marcar todas como pagas y cerrar
      item.cuotasArray.fill(true);
      item.saldado = true;
      item.fechaCierre = new Date().toLocaleDateString();
      guardarData();
      renderAll();
      mostrarAlerta("Crédito Cerrado", "El crédito se marcó como saldado y se trasladó al historial.");
    }
  );
}

// Exportar en JSON
function exportarDatosJSON() {
  if (prestamos.length === 0) {
    mostrarAlerta("Aviso", "No hay registros para exportar.");
    return;
  }
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prestamos, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `respaldo_prestamos_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Exportar CSV compatible con Excel
function exportarExcelCSV() {
  if (prestamos.length === 0) {
    mostrarAlerta("Aviso", "No hay datos para exportar a Excel.");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Fecha Emision;Solicitante;Monto;Cuotas Totales;Cuotas Pagadas;Garantia;Estado\r\n";
  prestamos.forEach(p => {
    let pagadasCount = p.cuotasArray ? p.cuotasArray.filter(Boolean).length : 0;
    let estadoStr = p.saldado ? "Saldado" : "Activo";
    csvContent += `${p.fechaEmision};"${p.receptor}";${p.monto};${p.cuotasTotales};${pagadasCount};"${p.documento}";${estadoStr}\r\n`;
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `reporte_prestamos_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function importarDatosJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (Array.isArray(importedData)) {
        // Asegurar compatibilidad si algún registro anterior no tenía cuotasArray
        prestamos = importedData.map(p => {
          if (!p.cuotasArray) {
            let pagadas = p.cuotasPagadas || 0;
            p.cuotasArray = new Array(p.cuotasTotales || 12).fill(false);
            for(let i=0; i<pagadas; i++) p.cuotasArray[i] = true;
          }
          return p;
        });
        guardarData();
        renderAll();
        mostrarAlerta("Éxito", "¡Base de datos restaurada con éxito!");
      } else {
        mostrarAlerta("Error", "El archivo no es válido.");
      }
    } catch (err) {
      mostrarAlerta("Error", "Error al leer el archivo JSON.");
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  const tbodyActivos = document.getElementById('tabla-activos');
  const tbodyHistorial = document.getElementById('tabla-historial');
  const filtro = document.getElementById('searchInput').value.toLowerCase();

  tbodyActivos.innerHTML = '';
  tbodyHistorial.innerHTML = '';

  let countActivos = 0;
  let countSaldados = 0;
  let montoEnCalle = 0;

  prestamos.forEach(p => {
    if (!p.cuotasArray) {
      p.cuotasArray = new Array(p.cuotasTotales || 12).fill(false);
    }

    if (filtro && !p.receptor.toLowerCase().includes(filtro)) return;

    let pagadasCount = p.cuotasArray.filter(Boolean).length;

    if (!p.saldado) {
      countActivos++;
      montoEnCalle += Number(p.monto);
      tbodyActivos.innerHTML += `
        <tr>
          <td>${p.fechaEmision}</td>
          <td><strong>${p.receptor}</strong></td>
          <td><span style="font-weight:700; color:var(--primary);">$${Number(p.monto).toLocaleString()}</span></td>
          <td><span style="font-weight: 600; color: var(--primary-light);">${pagadasCount} de ${p.cuotasTotales} cuotas pagas</span></td>
          <td>${p.documento}</td>
          <td>
            <button class="btn-action" onclick="abrirControlCuotas(${p.id})">📋 Gestionar Cuotas</button>
            <button class="btn-action btn-saldar" onclick="saldarCreditoManual(${p.id})">✅ Saldar Total</button>
          </td>
        </tr>
      `;
    } else {
      countSaldados++;
      tbodyHistorial.innerHTML += `
        <tr>
          <td>${p.fechaEmision}</td>
          <td>${p.fechaCierre || 'N/D'}</td>
          <td><strong>${p.receptor}</strong></td>
          <td>$${Number(p.monto).toLocaleString()}</td>
          <td>${p.documento} (Devuelta)</td>
          <td><span class="badge badge-pagado">Saldado</span></td>
        </tr>
      `;
    }
  });

  document.getElementById('count-activos').textContent = countActivos;
  document.getElementById('count-devueltos').textContent = countSaldados;
  document.getElementById('monto-calle').textContent = `$${montoEnCalle.toLocaleString()}`;
}

renderAll();