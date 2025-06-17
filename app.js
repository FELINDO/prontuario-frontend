document.addEventListener('DOMContentLoaded', () => {
    // --- GUARDA DE AUTENTICAÇÃO E INICIALIZAÇÃO ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // URL base da sua API de produção CORRIGIDA
    const API_BASE_URL = 'https://prontuario-backend-java.onrender.com';

    let selectedPatientId = null;

    // --- Mapeamento de Elementos da UI ---
    const ui = {
        mainMenu: document.getElementById('main-menu-screen'),
        professionalScreen: document.getElementById('professional-screen'),
        patientScreen: document.getElementById('patient-screen'),
        requestsScreen: document.getElementById('requests-screen'),
        sensorScreen: document.getElementById('sensor-screen'),
        userNameSpan: document.getElementById('user-name'),
        lastAccessInfo: document.getElementById('last-access-info'),
        menuProfessionalBtn: document.getElementById('menu-professional-button'),
        menuPatientBtn: document.getElementById('menu-patient-button'),
        menuViewRequestsBtn: document.getElementById('menu-view-requests-button'),
        menuSensorBtn: document.getElementById('menu-sensor-button'),
        logoutBtn: document.getElementById('logout-button'),
        searchInput: document.getElementById('search-patient-input'),
        searchResultList: document.getElementById('found-patients-list'),
        patientDetailsSection: document.getElementById('patient-details-section'),
        displayPatientName: document.getElementById('display-patient-name'),
        professionalHistoryBox: document.getElementById('professional-history-box'),
        addAttendanceForm: {
            motivo: document.getElementById('motivo-consulta'),
            descricao: document.getElementById('descricao-geral'),
            procedimentos: document.getElementById('procedimentos'),
            solicitacoes: document.getElementById('solicitacoes-exames'),
            resultados: document.getElementById('resultados-exames'),
            risco: document.getElementById('risk-level-select')
        },
        addAttendanceBtn: document.getElementById('add-attendance-button'),
        attendanceFeedback: document.getElementById('attendance-feedback'),
        myPatientName: document.getElementById('my-patient-name'),
        myPatientCpf: document.getElementById('my-patient-cpf'),
        myPatientAge: document.getElementById('my-patient-age'),
        myPatientSexo: document.getElementById('my-patient-sexo'),
        myPatientAllergies: document.getElementById('my-patient-allergies'),
        myPatientInsulin: document.getElementById('my-patient-insulin'),
        myPatientVaccines: document.getElementById('my-patient-vaccines'),
        myPatientMeds: document.getElementById('my-patient-meds'),
        myFullHistory: document.getElementById('my-full-history'),
        motivoSolicitacaoInput: document.getElementById('motivo-solicitacao'),
        submitRequestBtn: document.getElementById('submit-request-button'),
        requestFeedback: document.getElementById('request-feedback'),
        requestsListContainer: document.getElementById('requests-list-container'),
    };

    // --- Funções Utilitárias ---
    const showScreen = (screenId) => {
        ['main-menu-screen', 'professional-screen', 'patient-screen', 'requests-screen', 'sensor-screen'].forEach(id => {
            const screen = document.getElementById(id);
            if (screen) screen.classList.add('hidden');
        });
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) screenToShow.classList.remove('hidden');
    };

    const performLogout = () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    };

    const showFeedback = (element, message, isSuccess) => {
        if (!element) return;
        element.textContent = message;
        element.className = `feedback-text ${isSuccess ? 'success' : 'error'}`;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 4000);
    };

    // --- Funções de Lógica do App ---
    const handlePatientSearch = async () => {
        const termo = ui.searchInput.value;
        if (termo.length < 2) {
            ui.searchResultList.innerHTML = '';
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/buscarPacientes?termo=${termo}`);
            const pacientes = await response.json();
            ui.searchResultList.innerHTML = '';
            if (pacientes.length === 0) {
                ui.searchResultList.innerHTML = '<p class="placeholder-text">Nenhum paciente encontrado.</p>';
            } else {
                pacientes.forEach(p => {
                    const item = document.createElement('div');
                    item.className = 'patient-list-item';
                    item.textContent = `${p.name} - CPF: ${p.cpf}`;
                    item.onclick = () => loadFullProntuarioForProf(p.id);
                    ui.searchResultList.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Erro ao buscar pacientes:', error);
        }
    };

    const loadFullProntuarioForProf = async (pacienteId) => {
        selectedPatientId = pacienteId;
        ui.searchResultList.innerHTML = '';
        ui.searchInput.value = '';
        try {
            const response = await fetch(`${API_BASE_URL}/api/carregarProntuario?id=${pacienteId}`);
            const prontuario = await response.json();
            ui.displayPatientName.textContent = prontuario.perfil.name;
            ui.professionalHistoryBox.innerHTML = '';
            if (prontuario.atendimentos.length === 0) {
                ui.professionalHistoryBox.innerHTML = '<p class="placeholder-text">Este paciente ainda não possui atendimentos.</p>';
            } else {
                prontuario.atendimentos.forEach(att => {
                    const entry = document.createElement('div');
                    entry.className = 'history-entry';
                    entry.innerHTML = `<strong>${att.data}</strong> por <strong>${att.profissional}</strong><br><em>Motivo: ${att.motivo}</em><p>${att.descricao || ''}</p>`;
                    ui.professionalHistoryBox.appendChild(entry);
                });
            }
            ui.patientDetailsSection.classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao carregar prontuário:', error);
            showFeedback(ui.attendanceFeedback, "Não foi possível carregar os dados do prontuário.", false);
        }
    };

    const handleSaveAttendance = async () => {
        const atendimentoData = {
            pacienteId: selectedPatientId,
            profissionalId: currentUser.id,
            nomeProfissional: currentUser.name,
            motivoConsulta: ui.addAttendanceForm.motivo.value,
            descricaoGeral: ui.addAttendanceForm.descricao.value,
            procedimentosRealizados: ui.addAttendanceForm.procedimentos.value,
            solicitacoesExames: ui.addAttendanceForm.solicitacoes.value,
            resultadosExames: ui.addAttendanceForm.resultados.value,
            risco: ui.addAttendanceForm.risco.value,
        };
        if (!atendimentoData.motivoConsulta) {
            showFeedback(ui.attendanceFeedback, "O motivo da consulta é obrigatório.", false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/adicionarAtendimento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(atendimentoData)
            });
            const result = await response.json();
            showFeedback(ui.attendanceFeedback, result.message, result.success);
            if (result.success) {
                loadFullProntuarioForProf(selectedPatientId);
                Object.values(ui.addAttendanceForm).forEach(input => input.value = '');
            }
        } catch (error) {
            console.error('Erro ao salvar atendimento:', error);
            showFeedback(ui.attendanceFeedback, 'Erro de conexão ao salvar atendimento.', false);
        }
    };
    
    const renderRequests = (requests) => {
        ui.requestsListContainer.innerHTML = '';
        if (requests.length === 0) {
            ui.requestsListContainer.innerHTML = '<p class="placeholder-text">Nenhuma solicitação pendente no momento.</p>';
        } else {
            requests.forEach(req => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'request-item';
                itemDiv.innerHTML = `<h4>${req.pacienteNome}</h4><p><strong>CPF:</strong> ${req.pacienteCpf} | <strong>Idade:</strong> ${req.pacienteIdade}</p><p class="motivo">"${req.motivoPaciente}"</p>`;
                itemDiv.addEventListener('click', () => {
                    showScreen('professional-screen');
                    loadFullProntuarioForProf(req.pacienteId);
                });
                ui.requestsListContainer.appendChild(itemDiv);
            });
        }
    };
    
    const fetchAndShowRequests = async () => {
        showScreen('requests-screen');
        ui.requestsListContainer.innerHTML = '<p class="placeholder-text">Carregando solicitações...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/listarSolicitacoes`);
            if (!response.ok) throw new Error('Falha ao buscar dados.');
            const requests = await response.json();
            renderRequests(requests);
        } catch (error) {
            console.error("Erro ao buscar solicitações:", error);
            ui.requestsListContainer.innerHTML = '<p class="placeholder-text error">Não foi possível carregar as solicitações.</p>';
        }
    };

    const handleConsultaRequest = async () => {
        const motivo = ui.motivoSolicitacaoInput.value.trim();
        if (!motivo) {
            showFeedback(ui.requestFeedback, "Por favor, descreva o motivo da sua solicitação.", false);
            return;
        }
        const requestData = { pacienteId: currentUser.id, motivo: motivo };
        try {
            const response = await fetch(`${API_BASE_URL}/api/solicitarConsulta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            const result = await response.json();
            showFeedback(ui.requestFeedback, result.message, result.success);
            if (result.success) ui.motivoSolicitacaoInput.value = '';
        } catch (error) {
            showFeedback(ui.requestFeedback, "Erro de conexão ao enviar solicitação.", false);
        }
    };

    const loadPatientDataAndHistory = async (patientId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/carregarProntuario?id=${patientId}`);
            if (!response.ok) throw new Error('Falha ao carregar dados do prontuário.');
            const prontuario = await response.json();
            const perfil = prontuario.perfil;
            const atendimentos = prontuario.atendimentos;
            
            ui.myPatientName.textContent = perfil.name || '';
            ui.myPatientCpf.textContent = perfil.cpf || '';
            ui.myPatientAge.textContent = perfil.age || '';
            ui.myPatientSexo.textContent = perfil.sexo || '';
            ui.myPatientAllergies.textContent = perfil.alergias || 'Nenhuma informada';
            ui.myPatientInsulin.textContent = perfil.necessita_insulina ? 'Sim' : 'Não';
            ui.myPatientVaccines.textContent = perfil.historico_vacinacao || 'Nenhum informado';
            ui.myPatientMeds.textContent = perfil.medicamentos_uso_continuo || 'Nenhum informado';

            ui.myFullHistory.innerHTML = '';
            if (!atendimentos || atendimentos.length === 0) {
                ui.myFullHistory.innerHTML = '<p class="placeholder-text">Você ainda não possui atendimentos registrados.</p>';
            } else {
                atendimentos.forEach(att => {
                    const detailsItem = document.createElement('details');
                    detailsItem.className = 'history-details-item';
                    const summary = document.createElement('summary');
                    summary.className = 'history-summary';
                    summary.innerHTML = `<span>${att.data} - Atendido(a) por: <strong>${att.profissional}</strong></span>`;
                    const content = document.createElement('div');
                    content.className = 'history-content';
                    content.innerHTML = `
                        <p><strong>Motivo da Consulta:</strong> ${att.motivo || 'Não informado'}</p>
                        <p><strong>Descrição e Anamnese:</strong> ${att.descricao || 'Não informado'}</p>
                        <p><strong>Procedimentos Realizados:</strong> ${att.procedimentos_realizados || 'Nenhum'}</p>
                        <p><strong>Exames Solicitados:</strong> ${att.solicitacoes_exames || 'Nenhum'}</p>
                        <p><strong>Resultados de Exames:</strong> ${att.resultados_exames || 'Nenhum'}</p>
                        <p><strong>Nível de Risco:</strong> ${att.risco || 'Não classificado'}</p>
                    `;
                    detailsItem.appendChild(summary);
                    detailsItem.appendChild(content);
                    ui.myFullHistory.appendChild(detailsItem);
                });
            }
        } catch (error) {
            console.error(error);
            ui.myFullHistory.innerHTML = '<p class="placeholder-text error">Não foi possível carregar seu histórico.</p>';
        }
    };

    // --- CONFIGURAÇÃO INICIAL E ROTEAMENTO POR TIPO DE USUÁRIO ---
    document.getElementById('logout-button').addEventListener('click', performLogout);
    document.getElementById('back-to-menu-prof').addEventListener('click', () => {
        ui.patientDetailsSection.classList.add('hidden');
        showScreen('main-menu-screen');
    });
    document.getElementById('back-to-menu-requests').addEventListener('click', () => showScreen('main-menu-screen'));
    document.getElementById('back-to-menu-patient').addEventListener('click', performLogout);
    
    if (currentUser.userType === 'Paciente') {
        ui.menuProfessionalBtn.style.display = 'none';
        ui.menuViewRequestsBtn.style.display = 'none';
        ui.menuPatientBtn.style.display = 'none';
        loadPatientDataAndHistory(currentUser.id);
        if (ui.submitRequestBtn) ui.submitRequestBtn.addEventListener('click', handleConsultaRequest);
        showScreen('patient-screen');
    } else { // Profissionais
        if (ui.userNameSpan) ui.userNameSpan.textContent = currentUser.name;
        if (ui.lastAccessInfo) ui.lastAccessInfo.textContent = `Último acesso em: ${new Date().toLocaleString('pt-BR')}`;
        ui.menuPatientBtn.style.display = 'none';
        ui.menuProfessionalBtn.addEventListener('click', () => showScreen('professional-screen'));
        ui.menuViewRequestsBtn.addEventListener('click', fetchAndShowRequests);
        ui.searchInput.addEventListener('input', handlePatientSearch);
        ui.addAttendanceBtn.addEventListener('click', handleSaveAttendance);
        showScreen('main-menu-screen');
    }
});
