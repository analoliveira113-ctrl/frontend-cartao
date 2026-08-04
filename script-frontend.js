// ======================================================
// CONFIGURAÇÃO DA URL DA API
// ======================================================
// Substiua pelo link REAL do seu backend na Vercel:
const BACKEND_VERCEL_URL = 'https://backend-cartao-4sp7fmm0p-analoliveira113-3040s-projects.vercel.app'; 

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : `${BACKEND_VERCEL_URL}/api`;

console.log('📡 API Conectada em:', API_URL);

// ======================================================
// FUNÇÃO DE FETCH
// ======================================================
async function fazerRequisicao(endpoint, dados = null) {
    const url = `${API_URL}${endpoint}`;
    console.log('📡 Requisição:', url, dados);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        
        const data = await response.json();
        console.log('✅ Resposta:', data);
        
        if (!response.ok) {
            throw new Error(data.erro || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro:', error);
        throw error;
    }
}

async function testarConexao() {
    try {
        const response = await fetch(`${API_URL}/teste`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log('✅ CONEXÃO OK:', data);
        return true;
    } catch (error) {
        console.error('❌ ERRO:', error);
        return false;
    }
}

// ======================================================
// VARIÁVEIS GLOBAIS
// ======================================================
let map = null;
let cardMarker = null;
let userMarker = null;
let circle = null;
let distanceLine = null;
let distancePopup = null;
let userLocation = { lat: -23.5015, lng: -47.4581 };
let isUsingSimulatedLocation = true;
let radarAutenticado = false;
let radarDados = null;

// ======================================================
// FUNÇÃO MOSTRAR/OCULTAR SENHA
// ======================================================
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
        button.style.color = '#8b5cf6';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
        button.style.color = 'rgba(255,255,255,0.4)';
    }
}

// ======================================================
// TABS
// ======================================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(tab.dataset.tab).classList.remove('hidden');
        if (tab.dataset.tab === 'radar') {
            setTimeout(initMap, 300);
        }
    });
});

// ======================================================
// CADASTRO
// ======================================================
document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const codigoCartao = document.getElementById('codigoCartao').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const resultado = document.getElementById('cadastroResultado');

    if (!nome || !codigoCartao || !matricula) {
        showResult(resultado, 'error', '⚠️ Preencha todos os campos.');
        return;
    }

    showLoading(resultado);
    
    try {
        const data = await fazerRequisicao('/meu-cartao/cadastrar', {
            nome,
            codigoCartao,
            matricula
        });

        if (data.sucesso) {
            resultado.innerHTML = `
                <div class="success">✅ ${data.mensagem}</div>
                <div class="highlight">
                    <div class="detail"><strong>👤 Aluno:</strong> ${data.dadosCadastrados.nomeAluno}</div>
                    <div class="detail"><strong>🎓 Matrícula:</strong> ${data.dadosCadastrados.matricula}</div>
                    <div class="detail"><strong>💳 Código:</strong> ${data.dadosCadastrados.idCartao}</div>
                    <div class="detail"><strong>📍 Local:</strong> ${data.dadosCadastrados.localPerdido}</div>
                    <div class="detail"><strong>📌 Status:</strong> <span class="status-perdido">🚨 PERDIDO</span></div>
                </div>
                <div style="margin-top:12px; color:#60a5fa; font-size:14px;">
                    💡 Agora vá na aba <strong>"Consultar"</strong> com seu código + matrícula!
                </div>
            `;
            resultado.classList.add('visible');
            document.getElementById('cadastroForm').reset();
        } else {
            showResult(resultado, 'error', data.erro || '❌ Erro ao cadastrar.');
        }
    } catch (error) {
        showResult(resultado, 'error', `❌ ${error.message}`);
        console.error(error);
    }
});

// ======================================================
// CONSULTA
// ======================================================
document.getElementById('consultaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codigoCartao = document.getElementById('consultaCodigo').value.trim();
    const matricula = document.getElementById('consultaMatricula').value.trim();
    const resultado = document.getElementById('consultaResultado');

    if (!codigoCartao || !matricula) {
        showResult(resultado, 'error', '⚠️ Preencha o código e a matrícula.');
        return;
    }

    showLoading(resultado);
    
    try {
        const data = await fazerRequisicao('/meu-cartao/consultar', {
            codigoCartao,
            matricula
        });

        if (data.sucesso) {
            resultado.innerHTML = `
                <div style="margin-bottom:10px; color:#4ade80; font-weight:600;">✅ Cartão Encontrado!</div>
                <div class="detail"><strong>👤 Aluno:</strong> ${data.aluno}</div>
                <div class="detail"><strong>🎓 Matrícula:</strong> ${data.matricula}</div>
                <div class="detail"><strong>💳 Código:</strong> ${data.cartaoCodigo}</div>
                <div class="detail"><strong>📌 Status:</strong> <span class="status-perdido">🚨 ${data.statusAtual}</span></div>
                <div class="highlight">
                    <strong>📍 Última localização:</strong><br>
                    ${data.localizacao?.ondeFoiVisto || 'Não informado'}<br>
                    <small style="color:rgba(255,255,255,0.4);">
                        🕐 ${data.localizacao?.registradoAs || 'Não registrado'}
                    </small>
                </div>
                <div style="margin-top:12px; color:#60a5fa; font-size:14px;">
                    💡 Vá na aba <strong>"Radar"</strong> e use o mesmo código + matrícula!
                </div>
            `;
            resultado.classList.add('visible');
        } else {
            showResult(resultado, 'error', data.erro || '❌ Cartão não encontrado.');
        }
    } catch (error) {
        showResult(resultado, 'error', `❌ ${error.message}`);
        console.error(error);
    }
});

// ======================================================
// RADAR - LOGIN
// ======================================================
document.getElementById('radarLoginBtn').addEventListener('click', async () => {
    const codigoCartao = document.getElementById('radarCodigo').value.trim();
    const matricula = document.getElementById('radarMatricula').value.trim();
    const status = document.getElementById('radarLoginStatus');

    if (!codigoCartao || !matricula) {
        status.innerHTML = '⚠️ Preencha o código e a matrícula.';
        status.style.color = '#f87171';
        return;
    }

    status.innerHTML = '⏳ Verificando...';
    status.style.color = '#60a5fa';

    try {
        const data = await fazerRequisicao('/meu-cartao/consultar', {
            codigoCartao,
            matricula
        });

        if (data.sucesso) {
            radarAutenticado = true;
            radarDados = data;
            status.innerHTML = '✅ Autenticado com sucesso!';
            status.style.color = '#4ade80';
            document.getElementById('radarLoginArea').style.display = 'none';
            document.getElementById('radarContent').style.display = 'block';
            if (data.localizacao) {
                setTimeout(() => {
                    updateCardMarker(
                        data.localizacao.latitude, 
                        data.localizacao.longitude, 
                        data.localizacao.ondeFoiVisto, 
                        0
                    );
                }, 500);
            }
        } else {
            status.innerHTML = '❌ ' + (data.erro || 'Cartão não encontrado.');
            status.style.color = '#f87171';
        }
    } catch (error) {
        status.innerHTML = `❌ ${error.message}`;
        status.style.color = '#f87171';
        console.error(error);
    }
});

// ======================================================
// RADAR - ATUALIZAR
// ======================================================
document.getElementById('radarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!radarAutenticado || !radarDados) {
        showResult(document.getElementById('radarResultado'), 'error', '⚠️ Faça login no radar primeiro.');
        return;
    }

    const sinalRssi = parseInt(document.getElementById('sinalRssi').value);
    const resultado = document.getElementById('radarResultado');
    showLoading(resultado);

    try {
        const data = await fazerRequisicao('/meu-cartao/simular-radar', {
            codigoCartao: radarDados.cartaoCodigo,
            matricula: radarDados.matricula,
            sinalRssi
        });

        if (data.sucesso) {
            if (data.localizacao) {
                updateCardMarker(
                    data.localizacao.latitude,
                    data.localizacao.longitude,
                    data.localizacao.ondeFoiVisto,
                    data.raio || 0
                );
            }

            let highlightClass = 'highlight';
            let icon = '📡';
            let cor = '#8b5cf6';
            
            if (sinalRssi >= -50) {
                highlightClass = 'highlight-fire';
                icon = '🔥';
                cor = '#fb923c';
            } else if (sinalRssi < -50 && sinalRssi >= -75) {
                highlightClass = 'highlight';
                icon = '🧯';
                cor = '#8b5cf6';
            } else {
                highlightClass = 'highlight-cold';
                icon = '🧊';
                cor = '#60a5fa';
            }

            let distanciaTexto = '';
            if (userMarker && cardMarker) {
                const userPos = userMarker.getLatLng();
                const cardPos = cardMarker.getLatLng();
                const dist = userPos.distanceTo(cardPos);
                distanciaTexto = dist > 1000 ? 
                    `📏 ${(dist/1000).toFixed(2)} km` : 
                    `📏 ${Math.round(dist)} metros`;
            }

            resultado.innerHTML = `
                <div style="margin-bottom:10px; color:#60a5fa; font-weight:600;">📡 Radar Atualizado</div>
                <div class="detail"><strong>👤 Aluno:</strong> ${data.aluno}</div>
                <div class="detail"><strong>📍 Local:</strong> ${data.localizacao?.ondeFoiVisto || 'Não informado'}</div>
                <div class="detail"><strong>📶 Sinal:</strong> ${data.sinalMedidoDb} dBm</div>
                ${distanciaTexto ? `<div class="detail"><strong>${distanciaTexto}</strong></div>` : ''}
                <div class="${highlightClass}" style="border-left-color:${cor};">
                    <div style="font-size:18px; font-weight:700; margin-bottom:6px; color:${cor};">
                        ${icon} ${data.statusRadar}
                    </div>
                    <div style="color:rgba(255,255,255,0.9);">${data.orientacao}</div>
                </div>
            `;
            resultado.classList.add('visible');
        } else {
            showResult(resultado, 'error', data.erro || '❌ Erro ao atualizar radar.');
        }
    } catch (error) {
        showResult(resultado, 'error', `❌ ${error.message}`);
        console.error(error);
    }
});

// ======================================================
// MAPA
// ======================================================
function initMap() {
    if (map) { map.invalidateSize(); return; }
    
    map = L.map('mapaContainer').setView([-23.5015, -47.4581], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    map.on('click', function(e) {
        document.getElementById('simularLat').value = e.latlng.lat.toFixed(6);
        document.getElementById('simularLng').value = e.latlng.lng.toFixed(6);
        showNotification('📍 Coordenadas copiadas!', 'info');
    });

    document.getElementById('simularLocalizacaoBtn').addEventListener('click', () => {
        document.getElementById('simularLocalizacaoDiv').style.display = 'block';
    });

    document.getElementById('aplicarSimulacaoBtn').addEventListener('click', () => {
        const lat = parseFloat(document.getElementById('simularLat').value);
        const lng = parseFloat(document.getElementById('simularLng').value);
        if (isNaN(lat) || isNaN(lng)) {
            showNotification('❌ Coordenadas inválidas!', 'error');
            return;
        }
        userLocation = { lat, lng };
        isUsingSimulatedLocation = true;
        updateUserMarker(lat, lng);
        document.getElementById('simularLocalizacaoDiv').style.display = 'none';
        showNotification('✅ Localização atualizada!', 'success');
    });

    document.getElementById('ativarLocalizacaoBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            showNotification('❌ Geolocalização não suportada.', 'error');
            return;
        }
        showNotification('📍 Obtendo localização...', 'info');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                isUsingSimulatedLocation = false;
                updateUserMarker(pos.coords.latitude, pos.coords.longitude);
                showNotification('✅ Localização real ativada!', 'success');
            },
            () => showNotification('❌ Erro ao obter localização.', 'error')
        );
    });

    addLegend();
    setTimeout(() => updateUserMarker(userLocation.lat, userLocation.lng), 500);
}

function addLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-control-legend');
        div.innerHTML = `
            <div class="legend-item"><span class="legend-dot user"></span><span>🧑 Você</span></div>
            <div class="legend-item"><span class="legend-dot card"></span><span>🎯 Cartão</span></div>
            <div class="legend-item"><span class="legend-line"></span><span>📏 Distância</span></div>
            ${isUsingSimulatedLocation ? '<div style="margin-top:6px;font-size:10px;color:#fbbf24;">🔶 Modo Simulação</div>' : '<div style="margin-top:6px;font-size:10px;color:#4ade80;">✅ Localização Real</div>'}
        `;
        return div;
    };
    legend.addTo(map);
}

function updateUserMarker(lat, lng) {
    if (userMarker) { map.removeLayer(userMarker); }
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:#4ade80;width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 0 30px rgba(74,222,128,0.6);display:flex;align-items:center;justify-content:center;font-size:24px;animation:pulse-green 1.5s ease-in-out infinite;">🧑</div>`,
        iconSize: [54, 54],
        iconAnchor: [27, 27]
    });
    userMarker = L.marker([lat, lng], { icon }).addTo(map);
    if (cardMarker) { updateDistanceLine(); centralizarMapa(); }
}

function updateCardMarker(lat, lng, local, raio = 0) {
    if (cardMarker) { map.removeLayer(cardMarker); }
    if (circle) { map.removeLayer(circle); }
    
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:#ef4444;width:48px;height:48px;border-radius:50%;border:3px solid white;box-shadow:0 0 30px rgba(239,68,68,0.6);display:flex;align-items:center;justify-content:center;font-size:26px;animation:pulse-red 1.5s ease-in-out infinite;">🎯</div>`,
        iconSize: [58, 58],
        iconAnchor: [29, 29]
    });
    cardMarker = L.marker([lat, lng], { icon }).addTo(map);
    cardMarker.bindPopup(`
        <div style="text-align:center;">
            <div style="font-size:32px;">🎯</div>
            <div style="font-weight:bold;color:#ef4444;">CARTÃO PERDIDO!</div>
            <div style="font-size:14px;color:#aaa;">📍 ${local}</div>
            <div style="font-size:12px;color:#888;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
            ${raio > 0 ? `<div style="font-size:12px;color:#fbbf24;">📶 Raio: ${raio}m</div>` : ''}
        </div>
    `);
    
    if (raio > 0) {
        circle = L.circle([lat, lng], { 
            radius: raio, 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.15, 
            weight: 2, 
            dashArray: '5,5' 
        }).addTo(map);
    }
    updateDistanceLine();
    centralizarMapa();
}

function updateDistanceLine() {
    if (distanceLine) { map.removeLayer(distanceLine); }
    if (distancePopup) { map.removeLayer(distancePopup); }
    if (!userMarker || !cardMarker) return;
    
    const userPos = userMarker.getLatLng();
    const cardPos = cardMarker.getLatLng();
    const dist = userPos.distanceTo(cardPos);
    const text = dist > 1000 ? `${(dist/1000).toFixed(2)} km` : `${Math.round(dist)} metros`;
    
    distanceLine = L.polyline([userPos, cardPos], { 
        color: '#8b5cf6', 
        weight: 3, 
        opacity: 0.6, 
        dashArray: '8,8' 
    }).addTo(map);
    
    const mid = [(userPos.lat + cardPos.lat)/2, (userPos.lng + cardPos.lng)/2];
    const icon = L.divIcon({ 
        html: `<div style="background:rgba(139,92,246,0.9);color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.3);white-space:nowrap;">📏 ${text}</div>`, 
        iconSize: [0,0] 
    });
    distancePopup = L.marker(mid, { icon }).addTo(map);
}

function centralizarMapa() {
    if (!userMarker || !cardMarker) return;
    map.fitBounds(L.latLngBounds([userMarker.getLatLng(), cardMarker.getLatLng()]), { padding: [80,80] });
}

// ======================================================
// NOTIFICAÇÕES
// ======================================================
function showNotification(message, type = 'info') {
    const colors = { success: '#4ade80', error: '#f87171', info: '#60a5fa', warning: '#fbbf24' };
    const div = document.createElement('div');
    div.style.cssText = `
        position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;
        padding:12px 20px;border-radius:12px;border-left:4px solid ${colors[type] || '#8b5cf6'};
        box-shadow:0 4px 20px rgba(0,0,0,0.5);z-index:9999;max-width:400px;
        animation:slideInRight 0.5s ease;font-size:14px;backdrop-filter:blur(10px);
    `;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => { 
        div.style.animation = 'slideOutRight 0.5s ease'; 
        setTimeout(() => div.remove(), 500); 
    }, 5000);
}

// ======================================================
// UTILITÁRIOS
// ======================================================
function showResult(element, type, message) {
    element.innerHTML = `<div class="${type}">${message}</div>`;
    element.classList.add('visible');
}

function showLoading(element) {
    element.innerHTML = `<div class="loading"></div><span style="color:rgba(255,255,255,0.6);"> Carregando...</span>`;
    element.classList.add('visible');
}

// ======================================================
// SINAL - ATUALIZAR VALOR
// ======================================================
document.getElementById('sinalRssi').addEventListener('input', function() {
    document.getElementById('sinalValor').textContent = `${this.value} dBm`;
});

// ======================================================
// INICIALIZAR
// ======================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Página carregada!');
    console.log('📡 URL da API:', API_URL);
    
    const conectado = await testarConexao();
    if (!conectado) {
        document.querySelector('.container').innerHTML += `
            <div style="background:rgba(239,68,68,0.2);border:2px solid #ef4444;border-radius:12px;padding:20px;margin-top:20px;text-align:center;">
                <div style="font-size:48px;">🔌</div>
                <h3 style="color:#f87171;">Servidor não encontrado!</h3>
                <p style="color:rgba(255,255,255,0.7);">
                    Execute <code style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;">node script.js</code> no terminal
                </p>
            </div>
        `;
        return;
    }
    
    console.log('✅ Conexão estabelecida!');
    
    if (!document.getElementById('radar').classList.contains('hidden')) {
        setTimeout(initMap, 500);
    }
});

// ======================================================
// ANIMAÇÕES CSS
// ======================================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    @keyframes pulse-green {
        0% { box-shadow: 0 0 20px rgba(74,222,128,0.3); transform: scale(1); }
        50% { box-shadow: 0 0 50px rgba(74,222,128,0.7); transform: scale(1.1); }
        100% { box-shadow: 0 0 20px rgba(74,222,128,0.3); transform: scale(1); }
    }
    @keyframes pulse-red {
        0% { box-shadow: 0 0 20px rgba(239,68,68,0.3); transform: scale(1); }
        50% { box-shadow: 0 0 50px rgba(239,68,68,0.7); transform: scale(1.1); }
        100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); transform: scale(1); }
    }
`;
document.head.appendChild(style);