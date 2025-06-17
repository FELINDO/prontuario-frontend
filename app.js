document.addEventListener('DOMContentLoaded', () => {
    // --- GUARDA DE AUTENTICAÇÃO E CARREGAMENTO DE DADOS ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Carrega todos os "bancos de dados" simulados do localStorage
    let allUsers = JSON.parse(localStorage.getItem('prontuario_users')) || [];
    let allAtendimentos = JSON.parse(localStorage.getItem('prontuario_atendimentos')) || {};
    let allSolicitacoes = JSON.parse(localStorage.getItem('prontuario_solicitacoes')) || [];
    
    let selectedPatientId = null;

    // --- Mapeamento Completo dos Elementos da UI ---
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
        setTimeout(() => element.classList.add('hidden'), 3000);
    };

    // --- Funções de Lógica do App (Modificadas para localStorage) ---

    const handlePatientSearch = () => {
        const termo = ui.searchInput.value.toLowerCase();
        if (termo.length < 2) {
            ui.searchResultList.innerHTML = '';
            return;
        }
        const pacientes = allUsers.filter(u => u.userType === 'Paciente' && (u.name.toLowerCase().includes(termo) || u.cpf.includes(termo)));
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
    };

    const loadFullProntuarioForProf = (pacienteId) => {
        selectedPatientId = pacienteId;
        const perfil = allUsers.find(u => u.id === pacienteId);
        const atendimentos = allAtendimentos[pacienteId] || [];
        
        ui.displayPatientName.textContent = perfil.name;
        ui.professionalHistoryBox.innerHTML = '';
        if (atendimentos.length === 0) {
            ui.professionalHistoryBox.innerHTML = '<p class="placeholder-text">Este paciente ainda não possui atendimentos.</p>';
        } else {
            atendimentos.forEach(att => {
                const entry = document.createElement('div');
                entry.className = 'history-entry';
                entry.innerHTML = `<strong>${att.data}</strong> por <strong>${att.profissional}</strong><br><em>Motivo: ${att.motivo_consulta}</em><p>${att.descricao || ''}</p>`;
                ui.professionalHistoryBox.appendChild(entry);
            });
        }
        ui.patientDetailsSection.classList.remove('hidden');
    };

    const handleSaveAttendance = () => {
        const atendimentoData = {
            data: new Date().toLocaleString('pt-BR'),
            profissional: currentUser.name,
            motivo_consulta: ui.addAttendanceForm.motivo.value,
            descricao: ui.addAttendanceForm.descricao.value,
            procedimentos_realizados: ui.addAttendanceForm.procedimentos.value,
            solicitacoes_exames: ui.addAttendanceForm.solicitacoes.value,
            resultados_exames: ui.addAttendanceForm.resultados.value,
            risco: ui.addAttendanceForm.risco.value,
        };
        if (!atendimentoData.motivo_consulta) {
            showFeedback(ui.attendanceFeedback, "O motivo da consulta é obrigatório.", false);
            return;
        }
        if (!allAtendimentos[selectedPatientId]) {
            allAtendimentos[selectedPatientId] = [];
        }
        allAtendimentos[selectedPatientId].unshift(atendimentoData); // Adiciona no início
        localStorage.setItem('prontuario_atendimentos', JSON.stringify(allAtendimentos));
        
        showFeedback(ui.attendanceFeedback, "Atendimento registrado com sucesso!", true);
        loadFullProntuarioForProf(selectedPatientId);
        Object.values(ui.addAttendanceForm).forEach(input => input.value = '');
    };
    
    const renderRequests = (requests) => {
        ui.requestsListContainer.innerHTML = '';
        if (requests.length === 0) {
            ui.requestsListContainer.innerHTML = '<p class="placeholder-text">Nenhuma solicitação pendente no momento.</p>';
        } else {
            requests.forEach(req => {
                const paciente = allUsers.find(u => u.id === req.pacienteId);
                const itemDiv = document.createElement('div');
                itemDiv.className = 'request-item';
                itemDiv.innerHTML = `<h4>${paciente.name}</h4><p><strong>CPF:</strong> ${paciente.cpf} | <strong>Idade:</strong> ${paciente.age}</p><p class="motivo">"${req.motivo}"</p>`;
                itemDiv.addEventListener('click', () => {
                    showScreen('professional-screen');
                    loadFullProntuarioForProf(req.pacienteId);
                });
                ui.requestsListContainer.appendChild(itemDiv);
            });
        }
    };
    
    const fetchAndShowRequests = () => {
        const pendentes = allSolicitacoes.filter(s => s.status === 'Pendente');
        renderRequests(pendentes);
        showScreen('requests-screen');
    };

    const handleConsultaRequest = () => {
        const motivo = ui.motivoSolicitacaoInput.value.trim();
        if (!motivo) {
            showFeedback(ui.requestFeedback, "Por favor, descreva o motivo da sua solicitação.", false);
            return;
        }
        const newId = allSolicitacoes.length > 0 ? Math.max(...allSolicitacoes.map(s => s.id)) + 1 : 1;
        const requestData = { id: newId, pacienteId: currentUser.id, motivo: motivo, status: 'Pendente' };
        allSolicitacoes.push(requestData);
        localStorage.setItem('prontuario_solicitacoes', JSON.stringify(allSolicitacoes));
        showFeedback(ui.requestFeedback, "Sua solicitação foi enviada com sucesso!", true);
        ui.motivoSolicitacaoInput.value = '';
    };

    const loadPatientDataAndHistory = (patientId) => {
        const perfil = allUsers.find(u => u.id === patientId);
        const atendimentos = allAtendimentos[patientId] || [];
        
        ui.myPatientName.textContent = perfil.name;
        ui.myPatientCpf.textContent = perfil.cpf;
        ui.myPatientAge.textContent = perfil.age;
        ui.myPatientSexo.textContent = perfil.sexo;
        ui.myPatientAllergies.textContent = perfil.alergias || 'Nenhuma informada';
        ui.myPatientInsulin.textContent = perfil.necessita_insulina ? 'Sim' : 'Não';
        ui.myPatientVaccines.textContent = perfil.historico_vacinacao || 'Nenhum informado';
        ui.myPatientMeds.textContent = perfil.medicamentos_uso_continuo || 'Nenhum informado';

        ui.myFullHistory.innerHTML = '';
        if (atendimentos.length === 0) {
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
                    <p><strong>Motivo da Consulta:</strong> ${att.motivo_consulta || 'Não informado'}</p>
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
    };

    // --- CONFIGURAÇÃO INICIAL E ROTEAMENTO ---
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
        if (ui.lastAccessInfo) ui.lastAccessInfo.textContent = `Último acesso em: ${currentUser.lastAccess}`;
        ui.menuPatientBtn.style.display = 'none';
        ui.menuProfessionalBtn.addEventListener('click', () => showScreen('professional-screen'));
        ui.menuViewRequestsBtn.addEventListener('click', fetchAndShowRequests);
        ui.searchInput.addEventListener('input', handlePatientSearch);
        ui.addAttendanceBtn.addEventListener('click', handleSaveAttendance);
        showScreen('main-menu-screen');
    }
});
