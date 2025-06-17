document.addEventListener('DOMContentLoaded', () => {
    const userTypeSelect = document.getElementById('userType');
    const patientFields = document.getElementById('patient-specific-fields');
    const registerForm = document.getElementById('register-form');
    const feedback = document.getElementById('register-feedback');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    const togglePatientFields = () => {
        if (userTypeSelect.value === 'Paciente') {
            patientFields.style.display = 'block';
        } else {
            patientFields.style.display = 'none';
        }
    };
    userTypeSelect.addEventListener('change', togglePatientFields);
    togglePatientFields();

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });
    
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const users = JSON.parse(localStorage.getItem('prontuario_users')) || [];
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const newCpf = document.getElementById('cpf').value;

        if (users.some(user => user.cpf === newCpf)) {
            feedback.textContent = 'Erro: Este CPF já está cadastrado.';
            feedback.className = 'feedback-text error';
            feedback.classList.remove('hidden');
            return;
        }

        const newUser = {
            id: newId,
            userType: document.getElementById('userType').value,
            name: document.getElementById('name').value,
            cpf: newCpf,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value,
            sexo: document.getElementById('sexo').value,
        };

        if (newUser.userType === 'Paciente') {
            newUser.alergias = document.getElementById('alergias').value;
            newUser.historico_vacinacao = document.getElementById('vacinacao').value;
            newUser.medicamentos_uso_continuo = document.getElementById('medicamentos').value;
            newUser.necessita_insulina = document.querySelector('input[name="insulina"]:checked').value === 'true';
        }
        
        users.push(newUser);
        localStorage.setItem('prontuario_users', JSON.stringify(users));

        feedback.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
        feedback.className = 'feedback-text success';
        feedback.classList.remove('hidden');
        
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    });
});
