document.addEventListener('DOMContentLoaded', () => {
    // URL CORRIGIDA: Aponta para a raiz do servidor, sem o nome do projeto.
    const API_BASE_URL = 'https://prontuario-backend-java.onrender.com';

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
    userTypeSelect.addEventListener('change', togglePatientFields);
    togglePatientFields();

    // --- LÓGICA PARA MOSTRAR/ESCONDER SENHA ---
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });
    
    // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO DE CADASTRO ---
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = {
            userType: document.getElementById('userType').value,
            name: document.getElementById('name').value,
            cpf: document.getElementById('cpf').value,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value,
            sexo: document.getElementById('sexo').value,
        };

        if (formData.userType === 'Paciente') {
            formData.alergias = document.getElementById('alergias').value;
            formData.historico_vacinacao = document.getElementById('vacinacao').value;
            formData.medicamentos_uso_continuo = document.getElementById('medicamentos').value;
            formData.necessita_insulina = document.querySelector('input[name="insulina"]:checked').value;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cadastrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (!response.ok) {
                 throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            feedback.textContent = result.message;
            feedback.classList.remove('hidden');
            if (result.success) {
                feedback.className = 'feedback-text success';
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } else {
                feedback.className = 'feedback-text error';
            }
        } catch (error) {
            feedback.textContent = error.message;
            feedback.className = 'feedback-text error';
            feedback.classList.remove('hidden');
            console.error("Erro no fetch do cadastro:", error);
        }
    });
});
