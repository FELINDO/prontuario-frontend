document.addEventListener('DOMContentLoaded', () => {
    // --- Seleção dos Elementos da UI ---
    const userTypeSelect = document.getElementById('userType');
    const patientFields = document.getElementById('patient-specific-fields');
    const registerForm = document.getElementById('register-form');
    const feedback = document.getElementById('register-feedback');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // --- LÓGICA PARA MOSTRAR/ESCONDER CAMPOS DO PACIENTE ---
    const togglePatientFields = () => {
        if (userTypeSelect.value === 'Paciente') {
            patientFields.style.display = 'block';
        } else {
            patientFields.style.display = 'none';
        }
    };

    // Adiciona o evento que "ouve" as mudanças no dropdown de tipo de usuário
    userTypeSelect.addEventListener('change', togglePatientFields);

    // Garante que o estado inicial (ao carregar a página) esteja correto
    togglePatientFields();


    // --- LÓGICA PARA MOSTRAR/ESCONDER SENHA ---
    togglePassword.addEventListener('click', function () {
        // Alterna o tipo do input entre 'password' e 'text'
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterna o ícone entre 'fa-eye' e 'fa-eye-slash' e a cor
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });

    
    // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO DE CADASTRO ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento padrão da página

        // Coleta dos dados básicos do formulário
        const formData = {
            userType: document.getElementById('userType').value,
            name: document.getElementById('name').value,
            cpf: document.getElementById('cpf').value,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value,
            sexo: document.getElementById('sexo').value,
        };

        // Adiciona os dados específicos do paciente APENAS se o tipo for "Paciente"
        if (formData.userType === 'Paciente') {
            formData.alergias = document.getElementById('alergias').value;
            formData.historico_vacinacao = document.getElementById('vacinacao').value;
            formData.medicamentos_uso_continuo = document.getElementById('medicamentos').value;
            formData.necessita_insulina = document.querySelector('input[name="insulina"]:checked').value;
        }

        try {
            // Envia os dados para o back-end Java
            const response = await fetch('http://localhost:8080/prontuario-backend/api/cadastrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            // Exibe o feedback (sucesso ou erro) na tela
            feedback.textContent = result.message;
            feedback.classList.remove('hidden');

            if (result.success) {
                feedback.className = 'feedback-text success';
                // Redireciona para a tela de login após 2 segundos
                setTimeout(() => { 
                    window.location.href = 'login.html'; 
                }, 2000);
            } else {
                feedback.className = 'feedback-text error';
            }
        } catch (error) {
            feedback.textContent = 'Erro de conexão com o servidor. Verifique se o backend está no ar.';
            feedback.className = 'feedback-text error';
            feedback.classList.remove('hidden');
            console.error("Erro no fetch do cadastro:", error);
        }
    });
});