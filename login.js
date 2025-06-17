document.addEventListener('DOMContentLoaded', () => {
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
            const response = await fetch('https://prontuario-backend-java.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                // Login bem-sucedido!
                loginError.classList.add('hidden');
                
                // Armazena os dados do usuário no localStorage para usar na próxima página (gerenciar a "sessão")
                result.user.lastAccess = new Date().toLocaleString('pt-BR');
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                
                // Redireciona para a tela principal do app
                window.location.href = 'app.html';
            } else {
                // Mostra a mensagem de erro vinda do PHP/Java
                loginError.textContent = result.message;
                loginError.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Erro no fetch de login:", error);
            loginError.textContent = 'Erro de conexão com o servidor. Verifique se o backend Java está rodando.';
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