document.addEventListener('DOMContentLoaded', () => {
    // Se não houver usuários no armazenamento, cria alguns para teste.
    if (!localStorage.getItem('prontuario_users')) {
        const sampleUsers = [
            { id: 1, userType: 'Medico', name: 'Dr. House', cpf: '111', password: '123', age: 45, sexo: 'Masculino' },
            { id: 2, userType: 'Paciente', name: 'Paciente Teste 1', cpf: '222', password: '123', age: 30, sexo: 'Feminino', alergias: 'Nenhuma', historico_vacinacao: 'Todas em dia', medicamentos_uso_continuo: 'Nenhum', necessita_insulina: false, dados_sensiveis: 'Nenhum' }
        ];
        const sampleAtendimentos = {
            '2': [
                { data: '17/06/2025 10:30', profissional: 'Dr. House', motivo_consulta: 'Check-up anual', descricao: 'Paciente saudável.', procedimentos_realizados: 'Aferição de pressão.', solicitacoes_exames: 'Hemograma completo.', resultados_exames: 'Aguardando.', risco: 'verde' }
            ]
        };
        localStorage.setItem('prontuario_users', JSON.stringify(sampleUsers));
        localStorage.setItem('prontuario_atendimentos', JSON.stringify(sampleAtendimentos));
    }

    const loginButton = document.getElementById('login-button');
    const cpfInput = document.getElementById('cpf');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const togglePassword = document.getElementById('togglePassword');

    loginButton.addEventListener('click', () => {
        const users = JSON.parse(localStorage.getItem('prontuario_users')) || [];
        const foundUser = users.find(user => user.cpf === cpfInput.value && user.password === passwordInput.value);

        if (foundUser) {
            foundUser.lastAccess = new Date().toLocaleString('pt-BR');
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            window.location.href = 'app.html';
        } else {
            loginError.textContent = 'CPF ou senha inválidos.';
            loginError.classList.remove('hidden');
        }
    });

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });
});
