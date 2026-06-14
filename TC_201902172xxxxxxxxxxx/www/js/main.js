
            const links = document.querySelectorAll('.nav-link');
            const toggle = document.querySelector('.nav-toggle');
            const menu = document.querySelector('.nav-menu');

            toggle.addEventListener('click', () => {
                menu.classList.toggle('show');
            });

            links.forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('show');
                });
            });

            // FETCH API
            const authForm = document.getElementById('auth-form');
            const authTitle = document.getElementById('auth-title');
            const authSubmitBtn = document.getElementById('auth-submit-btn');
            const authToggleBtn = document.getElementById('auth-toggle-btn');
            const emailGroup = document.getElementById('email-group');
            const authMessage = document.getElementById('auth-message');
            const crudSection = document.getElementById('crud-section');

            let isLoginMode = true;

            // Alternar entre Modo Login e Modo Registo
            authToggleBtn.addEventListener('click', () => {
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authTitle.innerText = "Área de Administração - Iniciar Sessão";
                    authSubmitBtn.innerText = "Entrar";
                    authToggleBtn.innerText = "Criar uma conta";
                    emailGroup.style.display = "none";
                    document.getElementById('auth-email').required = false;
                } else {
                    authTitle.innerText = "Criar Nova Conta Administrativa";
                    authSubmitBtn.innerText = "Registar Administrador";
                    authToggleBtn.innerText = "Já tenho conta (Login)";
                    emailGroup.style.display = "block";
                    document.getElementById('auth-email').required = true;
                }
            });

            // Submeter formulário de Autenticação
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const username = document.getElementById('auth-username').value;
                const password = document.getElementById('auth-password').value;
                const email = document.getElementById('auth-email').value;

                const url = isLoginMode ? '/api/auth/login' : '/api/auth/register';
                const payload = isLoginMode ? { username, password } : { username, email, password };

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        authMessage.style.color = "#28a745";
                        authMessage.innerText = data.message;

                        if (isLoginMode) {
                            crudSection.style.display = "block";
                            authForm.style.display = "none";
                            authTitle.innerText = `Sessão Iniciada: Administrador [${username}]`;
                            carregarArtigos(); // <- carregar artigos ao fazer login
                            document.getElementById('logout-btn').style.display = "block";
                        } else {
                            authToggleBtn.click();
                            authForm.reset();
                        }
                    } else {
                        authMessage.style.color = "#dc3545";
                        authMessage.innerText = data.error || "Erro ao processar pedido.";
                    }
                } catch (error) {
                    authMessage.style.color = "#dc3545";
                    authMessage.innerText = "Impossível ligar ao servidor backend.";
                }
            });
            async function carregarArtigosPublicos() {
                try {
                    const response = await fetch('/api/artigos');
                    const artigos = await response.json();
                    const lista = document.getElementById('lista-publica');

                    if (artigos.length === 0) {
                        lista.innerHTML = '<p>Ainda não foi publicado nenhum artigo.</p>';
                        return;
                    }

                    lista.innerHTML = artigos.map(a => `
            <hr>
            <h2>${a.titulo}</h2>
            <section>
                <h3>${a.categoria}</h3>
                <p>${a.conteudo}</p>
            </section>
        `).join('');
                } catch (error) {
                    console.error("Erro ao carregar artigos públicos:", error);
                }
            }
            // Carregar artigos da BD
            async function carregarArtigos() {
                try {
                    const response = await fetch('/api/artigos');
                    const artigos = await response.json();
                    const lista = document.getElementById('artigos-lista');

                    if (artigos.length === 0) {
                        lista.innerHTML = '<p style="color:#c9c9d4;">Nenhum artigo publicado.</p>';
                        return;
                    }

                    lista.innerHTML = artigos.map(a => `
            <div class="artigo-card" id="card-${a.id}">
                <strong>${a.titulo}</strong>
                <span class="artigo-categoria">${a.categoria}</span>
                <p>${a.conteudo}</p>
                <div class="artigo-acoes">
                    <button class="btn-warning" onclick="mostrarFormularioEditar(${a.id}, '${encodeURIComponent(a.titulo)}', '${encodeURIComponent(a.categoria)}', '${encodeURIComponent(a.conteudo)}')">Editar</button>
                    <button class="btn-primary" onclick="apagarArtigo(${a.id})">Apagar</button>
                </div>
                <div id="form-editar-${a.id}" style="display:none;" class="form-editar">
                    <div class="form-group">
                        <label>Título:</label>
                        <input type="text" id="edit-titulo-${a.id}">
                    </div>
                    <div class="form-group">
                        <label>Categoria:</label>
                        <input type="text" id="edit-categoria-${a.id}">
                    </div>
                    <div class="form-group">
                        <label>Conteúdo:</label>
                        <textarea id="edit-conteudo-${a.id}"></textarea>
                    </div>
                    <div class="artigo-acoes">
                        <button class="btn-success" onclick="guardarEdicao(${a.id})">Guardar</button>
                        <button class="btn-link" onclick="cancelarEdicao(${a.id})">Cancelar</button>
                    </div>
                </div>
            </div>
        `).join('');
                } catch (error) {
                    console.error("Erro ao carregar artigos:", error);
                }
            }

            function mostrarFormularioEditar(id, titulo, categoria, conteudo) {
                document.getElementById(`form-editar-${id}`).style.display = "block";
                document.getElementById(`edit-titulo-${id}`).value = decodeURIComponent(titulo);
                document.getElementById(`edit-categoria-${id}`).value = decodeURIComponent(categoria);
                document.getElementById(`edit-conteudo-${id}`).value = decodeURIComponent(conteudo);
            }

            function cancelarEdicao(id) {
                document.getElementById(`form-editar-${id}`).style.display = "none";
            }

            async function guardarEdicao(id) {
                const titulo = document.getElementById(`edit-titulo-${id}`).value;
                const categoria = document.getElementById(`edit-categoria-${id}`).value;
                const conteudo = document.getElementById(`edit-conteudo-${id}`).value;

                try {
                    const response = await fetch(`/api/artigos/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ titulo, categoria, conteudo })
                    });

                    if (response.ok) {
                        carregarArtigos();
                    } else {
                        const errData = await response.json();
                        alert(`Erro: ${errData.error}`);
                    }
                } catch (error) {
                    alert("Erro de comunicação com a API.");
                }
            }

            // Apagar artigo
            async function apagarArtigo(id) {
                if (!confirm("Tens a certeza que queres apagar este artigo?")) return;

                try {
                    const response = await fetch(`/api/artigos/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        carregarArtigos();
                    } else {
                        alert("Erro ao apagar artigo.");
                    }
                } catch (error) {
                    alert("Erro de comunicação com a API.");
                }
            }

            // Publicar artigo
            document.getElementById('artigo-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const titulo = document.getElementById('artigo-titulo').value;
                const categoria = document.getElementById('artigo-categoria').value;
                const conteudo = document.getElementById('artigo-conteudo').value;

                try {
                    const response = await fetch('/api/artigos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ titulo, categoria, conteudo })
                    });

                    if (response.ok) {
                        document.getElementById('artigo-form').reset();
                        carregarArtigos(); // atualiza a lista automaticamente
                    } else {
                        const errData = await response.json();
                        alert(`Erro: ${errData.error}`);
                    }
                } catch (error) {
                    alert("Erro de comunicação com a API.");
                }
            });
            carregarArtigosPublicos();


            async function verificarSessao() {
                try {
                    const response = await fetch('/api/auth/status');
                    const data = await response.json();

                    if (data.loggedIn) {
                        crudSection.style.display = "block";
                        authForm.style.display = "none";
                        authTitle.innerText = `Sessão Iniciada: Administrador [${data.username}]`;
                        carregarArtigos();
                        document.getElementById('logout-btn').style.display = "block";
                    }
                } catch (error) {
                    console.error("Erro ao verificar sessão:", error);
                }
            }

            verificarSessao();


            document.getElementById('logout-btn').addEventListener('click', async () => {
                try {
                    await fetch('/api/auth/logout');
                    crudSection.style.display = "none";
                    authForm.style.display = "block";
                    authTitle.innerText = "Área de Administração - Iniciar Sessão";
                    document.getElementById('logout-btn').style.display = "none";
                    authMessage.innerText = "";
                } catch (error) {
                    console.error("Erro ao terminar sessão:", error);
                }
            });

            function mostrarSecao(id) {
                document.querySelectorAll('main article').forEach(article => {
                    article.style.display = 'none';
                });
                document.getElementById(id).style.display = 'block';

                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('onclick') === `mostrarSecao('${id}')`) {
                        link.classList.add('active');
                    }
                });
            }
mostrarSecao('intro');