document.addEventListener('DOMContentLoaded', () => {
    // URL Base da API de Produção
    const API_BASE_URL = 'https://prontuario-backend-java.onrender.com';

    // --- Seleção dos Elementos da UI ---
    const loginButton = document.getElementById('login-button');
    const cpfInput = document.getElementById('cpf');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');
    const togglePassword = document.getElementById('togglePassword');

    // --- Lógica de Login (Comunicação com o Back-end) ---
    loginButton.addEventListener('click', async () => {
        const loginData = {
            cpf: cpfInput.value,
            password: passwordInput.value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            // Lê o corpo da resposta como JSON, independentemente do status
            const result = await response.json();

            // Verifica se a resposta foi um sucesso (status 2xx) E se a lógica interna do backend deu certo
            if (response.ok && result.success) {
                // Login bem-sucedido!
                loginError.classList.add('hidden');
                result.user.lastAccess = new Date().toLocaleString('pt-BR');
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                window.location.href = 'app.html';
            } else {
                // Se a resposta não foi OK ou result.success é false, mostra a mensagem de erro vinda do servidor
                throw new Error(result.message || 'Erro desconhecido retornado pelo servidor.');
            }
        } catch (error) {
            console.error("Erro no fetch de login:", error);
            // AGORA, a mensagem de erro exata do Java aparecerá aqui!
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        }
    });

    // --- Lógica para Mostrar/Esconder Senha ---
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });
});