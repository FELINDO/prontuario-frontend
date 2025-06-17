document.addEventListener('DOMContentLoaded', () => {
    // URL CORRIGIDA: Aponta para a raiz do servidor, sem o nome do projeto.
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
            // A URL da API é construída a partir da base
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
                
                // Armazena os dados do usuário no localStorage para usar na próxima página
                result.user.lastAccess = new Date().toLocaleString('pt-BR');
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redireciona para a tela principal do app
                window.location.href = 'app.html';
            } else {
                // Se a resposta não foi OK ou result.success é false, mostra a mensagem de erro vinda do servidor
                throw new Error(result.message || 'Erro desconhecido retornado pelo servidor.');
            }
        } catch (error) {
            // Este bloco "catch" é ativado se a rede falhar ou se a resposta não for um JSON válido
            console.error("Erro no fetch de login:", error);
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        }
    });

    // --- Lógica para Mostrar/Esconder Senha ---
    togglePassword.addEventListener('click', function () {
        // Alterna o tipo do input entre 'password' e 'text'
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterna o ícone entre 'fa-eye' e 'fa-eye-slash' e a cor
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('active');
    });
});
