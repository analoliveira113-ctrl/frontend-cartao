// ======================================================
// CONFIGURAÇÃO DA URL DA API
// ======================================================
const BACKEND_VERCEL_URL = 'https://backend-cartao.vercel.app'; 

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : `${BACKEND_VERCEL_URL}/api`;

console.log('📡 API Conectada em:', API_URL);

// ======================================================
// FUNÇÃO DE FETCH (Corrigida para aceitar dynamic methods e headers)
// ======================================================
async function fazerRequisicao(endpoint, dados = null, metodo = 'POST') {
    const url = `${API_URL}${endpoint}`;
    console.log('📡 Requisição:', url, dados);
    
    try {
        const opcoes = {
            method: metodo,
            headers: { 'Content-Type': 'application/json' }
        };
        if (dados && metodo !== 'GET') {
            opcoes.body = JSON.stringify(dados);
        }

        const response = await fetch(url, opcoes);
        const data = await response.json();
        console.log('✅ Resposta:', data);
        
        if (!response.ok) {
            throw new Error(data.mensagem || data.erro || `HTTP ${response.status}`);
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
        console.error('❌ ERRO AO CONECTAR:', error);
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
// TABS (Troca de abas corrigida)
// ======================================================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        const activeContent = document.getElementById(tab.dataset.tab);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
        if (tab.dataset.tab === 'radar') {
            setTimeout(initMap, 300);
        }
    });
});

// ======================================================
// CADASTRO (Corrigido conforme campos do Supabase)
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
            const cad = Array.isArray(data.data) ? data.data[0] : data.data;
            resultado.innerHTML = `
                <div class="success">✅ ${data.mensagem}</div>
                <div class="highlight">
                    <div class="detail"><strong>👤 Aluno:</strong> ${cad?.nome_aluno || nome}</div>
                    <div class="detail"><strong>🎓 Matrícula:</strong> ${cad?.matricula || matricula}</div>
                    <div class="detail"><strong>💳 Código:</strong> ${cad?.codigo_cartao || codigoCartao}</div>
                    <div class="detail"><strong>📌 Status:</strong> <span class="status-perdido">🚨 ${cad?.status || 'Ativo'}</span></div>
                </div>
                <div style="margin-top:12px; color:#60a5fa; font-size:14px;">
                    💡 Agora vá na aba <strong>"Consultar"</strong> com seu código + matrícula!
                </div>
            `;
            resultado.classList.add('visible');
            document.getElementById('cadastroForm').reset();
        } else {
            showResult(resultado, 'error', data.mensagem || '❌ Erro ao cadastrar.');
        }
    } catch (error) {
        showResult(resultado, 'error', `❌ ${error.message}`);
        console.error(error);
    }
});

// ======================================================
// CONSULTA (Corrigido para usar a estrutura de retorno do backend)
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

        if (data.sucesso && data.cartao) {
            const c = data.cartao;
            resultado.innerHTML = `
                <div style="margin-bottom:10px; color:#4ade80; font-weight:600;">✅ Cartão Encontrado!</div>
                <div class="detail"><strong>👤 Aluno:</strong> ${c.nome_aluno}</div>
                <div class="detail"><strong>🎓 Matrícula:</strong> ${c.matricula}</div>
                <div class="detail"><strong>💳 Código:</strong> ${c.codigo_cartao}</div>
                <div class="detail"><strong>📌 Status:</strong> <span class="status-perdido">🚨 ${c.status || 'Ativo'}</span></div>
                <div style="margin-top:12px; color:#60a5fa; font-size:14px;">
                    💡 Vá na aba <strong>"Radar com Mapa"</strong> para localizar no mapa!
                </div>
            `;
            resultado.classList.add('visible');
        } else {
            showResult(resultado, 'error', data.mensagem || '❌ Cartão não encontrado.');
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

        if (data.sucesso && data.cartao) {
            radarAutenticado = true;
            radarDados = data.cartao;
            status.innerHTML = '✅ Autenticado com sucesso!';
            status.style.color = '#4ade80';
            document.getElementById('radarLoginArea').style.display = 'none';
            document.getElementById('radarContent').style.display = 'block';
            setTimeout(initMap, 300);
        } else {
            status.innerHTML = '❌ ' + (data.mensagem || 'Cartão não encontrado.');
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
            codigoCartao: radarDados.codigo_cartao,
            matricula: radarDados.matricula,
            sinalRssi
        });

        if (data.sucesso) {
            updateCardMarker(
                userLocation.lat + 0.001,
                userLocation.lng + 0.001,
                "SENAI - Bloco A",
                data.distanciaEstimadaMetros || 10
            );

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

            resultado.innerHTML = `
                <div style="margin-bottom:10px; color:#60a5fa; font-weight:600;">📡 Radar Atualizado</div>
                <div class="detail"><strong>👤 Aluno:</strong> ${radarDados.nome_aluno}</div>
                <div class="detail"><strong>📶 Sinal:</strong> ${data.sinalRssi} dBm</div>
                <div class="${highlightClass}" style="border-left-color:${cor};">
                    <div style="font-size:18px; font-weight:700; margin-bottom:6px; color:${cor};">
                        ${icon} ${data.mensagem}
                    </div>
                </div>
            `;
            resultado.classList.add('visible');
        } else {
            showResult(resultado, 'error', data.mensagem || '❌ Erro ao atualizar radar.');
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
    
    const mapaElement = document.getElementById('mapaContainer');
    if (!mapaElement) return;

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
        `;
        return div;
    };
    legend.addTo(map);
}

function updateUserMarker(lat, lng) {
    if (userMarker) { map.removeLayer(userMarker); }
    const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background:#4ade80;width:44px;height:44px;border-radius:50%;border:3px solid white;box-shadow:0 0 30px rgba(74,222,128,0.6);display:flex;align-items:center;justify-content:center;font-size:24px;">🧑</div>`,
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
        html: `<div style="background:#ef4444;width:48px;height:48px;border-radius:50%;border:3px solid white;box-shadow:0 0 30px rgba(239,68,68,0.6);display:flex;align-items:center;justify-content:center;font-size:26px;">🎯</div>`,
        iconSize: [58, 58],
        iconAnchor: [29, 29]
    });
    cardMarker = L.marker([lat, lng], { icon }).addTo(map);
    cardMarker.bindPopup(`
        <div style="text-align:center;">
            <div style="font-size:32px;">🎯</div>
            <div style="font-weight:bold;color:#ef4444;">CARTÃO PERDIDO!</div>
            <div style="font-size:14px;color:#aaa;">📍 ${local}</div>
        </div>
    `);
    
    if (raio > 0) {
        circle = L.circle([lat, lng], { 
            radius: raio, 
            color: '#ef4444', 
            fillColor: '#ef4444', 
            fillOpacity: 0.15, 
            weight: 2 
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
        html: `<div style="background:rgba(139,92,246,0.9);color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;border:2px solid #fff;">📏 ${text}</div>`, 
        iconSize: [0,0] 
    });
    distancePopup = L.marker(mid, { icon }).addTo(map);
}

function centralizarMapa() {
    if (!userMarker || !cardMarker) return;
    map.fitBounds(L.latLngBounds([userMarker.getLatLng(), cardMarker.getLatLng()]), { padding: [80,80] });
}

// ======================================================
// NOTIFICAÇÕES & UTILITÁRIOS
// ======================================================
function showNotification(message, type = 'info') {
    const colors = { success: '#4ade80', error: '#f87171', info: '#60a5fa', warning: '#fbbf24' };
    const div = document.createElement('div');
    div.style.cssText = `
        position:fixed;top:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;
        padding:12px 20px;border-radius:12px;border-left:4px solid ${colors[type] || '#8b5cf6'};
        box-shadow:0 4px 20px rgba(0,0,0,0.5);z-index:9999;max-width:400px;font-size:14px;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

function showResult(element, type, message) {
    element.innerHTML = `<div class="${type}">${message}</div>`;
    element.classList.add('visible');
}

function showLoading(element) {
    element.innerHTML = `<div class="loading"></div><span style="color:rgba(255,255,255,0.6);"> Carregando...</span>`;
    element.classList.add('visible');
}

document.getElementById('sinalRssi').addEventListener('input', function() {
    document.getElementById('sinalValor').textContent = `${this.value} dBm`;
});

// ======================================================
// INICIALIZAR (Corrigido para não travar a UI caso falhe a conexão)
// ======================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Página carregada!');
    console.log('📡 URL da API:', API_URL);
    
    const conectado = await testarConexao();
    if (conectado) {
        showNotification('✅ Conectado ao servidor Vercel!', 'success');
    } else {
        showNotification('⚠️ Não foi possível conectar à API.', 'warning');
    }
});