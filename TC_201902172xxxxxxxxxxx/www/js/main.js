// NAV / MENU / SPA BÁSICO
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const links = document.querySelectorAll('.nav-link');
const newsletter = document.getElementById("newsletter-form");
const btn = document.getElementById("btn-onion");
const extra = document.querySelector(".onion-extra");



function carregarPagina(page) {
    fetch(`pages/${page}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            setupReadMore();
            // se a página tiver artigos públicos
            carregarArtigosPublicos?.();
        })
        .catch(() => {
            document.getElementById("content").innerHTML =
                "<p>Erro ao carregar conteúdo.</p>";
        });
}

function navigateTo(page) {
    window.location.hash = page;
    carregarPagina(page);
}

async function carregarArtigosPublicosSPA() {
    const lista = document.getElementById('artigos-lista');
    if (!lista) return;

    try {
        const response = await fetch('/api/artigos');
        const artigos = await response.json();

        if (!artigos.length) {
            lista.innerHTML = '<p>Nenhum artigo publicado.</p>';
            return;
        }

        lista.innerHTML = artigos.map(a => `
            <article class="artigo-card">
                <h3>${a.titulo}</h3>
                <span class="artigo-categoria">${a.categoria}</span>
                <p>${a.conteudo}</p>
            </article>
        `).join('');
    } catch (error) {
        lista.innerHTML = '<p>Erro ao carregar artigos.</p>';
    }
}


function mostrarAdmin() {
    document.getElementById("container-admin").style.display = "block";
    document.getElementById("content").style.display = "none";
    document.querySelector(".hero").style.display = "none";

    // carregar artigos e verificar sessão
    verificarSessao();
    carregarArtigos();
}

function esconderAdmin() {
    document.getElementById("container-admin").style.display = "none";
    document.getElementById("content").style.display = "block";
    document.querySelector(".hero").style.display = "flex";
}

window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "intro";
    carregarPagina(page);
});

window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "intro";

    if (page === "admin") {
        mostrarAdmin();
        return;
    }

    esconderAdmin();

    if (page === "artigos") {
        carregarPagina("artigos");
        setTimeout(carregarArtigosPublicosSPA, 100);
        return;
    }

    carregarPagina(page);
});

// inicial
if (location.hash === "#admin") {
    mostrarAdmin();
} else {
    navigateTo("intro");
}


// NEWSLETTER (com proteção)
if (newsletter) {
    newsletter.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        if (email === "") return;

        let emails = JSON.parse(localStorage.getItem("newsletterEmails")) || [];
        emails.push(email);
        localStorage.setItem("newsletterEmails", JSON.stringify(emails));

        document.getElementById("newsletter-msg").textContent =
            "Obrigado! A tua subscrição foi registada.";

        document.getElementById("email").value = "";
    });
}

const savedEmails = localStorage.getItem("newsletterEmails");
if (savedEmails) {
    // console.log("Emails já guardados:", savedEmails);
}

// LER MAIS
function setupReadMore() {
    const boxes = document.querySelectorAll(".readmore-box");
    boxes.forEach(box => {
        const btn = box.querySelector(".btn-readmore");
        const extra = box.querySelector(".readmore-extra");
        if (!btn || !extra) return;

        btn.addEventListener("click", () => {
            const isHidden = extra.style.display === "none" || extra.style.display === "";
            extra.style.display = isHidden ? "block" : "none";
            btn.textContent = isHidden ? "Ler menos" : "Ler mais";
        });
    });
}

// MENU MOBILE
if (toggle && menu) {
    toggle.addEventListener('click', () => {
        menu.classList.toggle('show');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('show');
        });
    });
}

// SCROLL SPY
const sections = [...document.querySelectorAll('main section, main article')];

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    let currentId = null;

    sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos && sec.offsetTop + sec.offsetHeight > scrollPos) {
            currentId = sec.id || sec.parentElement.id;
        }
    });

    links.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentId) {
            link.classList.add('active');
        }
    });
});

// ===================== ÁREA ADMIN / AUTH / CRUD =====================

const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const emailGroup = document.getElementById('email-group');
const authMessage = document.getElementById('auth-message');
const crudSection = document.getElementById('crud-section');

let isLoginMode = true;

if (authToggleBtn && authForm && authTitle && authSubmitBtn && emailGroup && authMessage && crudSection) {
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
                    carregarArtigos();
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
}

// ARTIGOS PÚBLICOS
async function carregarArtigosPublicos() {
    const lista = document.getElementById('lista-publica');
    if (!lista) return;

    try {
        const response = await fetch('/api/artigos');
        const artigos = await response.json();

        if (!artigos.length) {
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

// CRUD ARTIGOS (ADMIN)
async function carregarArtigos() {
    const lista = document.getElementById('artigos-lista');
    if (!lista) return;

    try {
        const response = await fetch('/api/artigos');
        const artigos = await response.json();

        if (!artigos.length) {
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
    const form = document.getElementById(`form-editar-${id}`);
    if (!form) return;
    form.style.display = "block";
    document.getElementById(`edit-titulo-${id}`).value = decodeURIComponent(titulo);
    document.getElementById(`edit-categoria-${id}`).value = decodeURIComponent(categoria);
    document.getElementById(`edit-conteudo-${id}`).value = decodeURIComponent(conteudo);
}

function cancelarEdicao(id) {
    const form = document.getElementById(`form-editar-${id}`);
    if (form) form.style.display = "none";
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

const artigoForm = document.getElementById('artigo-form');
if (artigoForm) {
    artigoForm.addEventListener('submit', async (e) => {
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
                artigoForm.reset();
                carregarArtigos();
            } else {
                const errData = await response.json();
                alert(`Erro: ${errData.error}`);
            }
        } catch (error) {
            alert("Erro de comunicação com a API.");
        }
    });
}

// SESSÃO ADMIN
async function verificarSessao() {
    if (!crudSection || !authForm || !authTitle) return;

    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();

        if (data.loggedIn) {
            crudSection.style.display = "block";
            authForm.style.display = "none";
            authTitle.innerText = `Sessão Iniciada: Administrador [${data.username}]`;
            carregarArtigos();
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.style.display = "block";
        }
    } catch (error) {
        console.error("Erro ao verificar sessão:", error);
    }
}

verificarSessao();

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout');
            if (crudSection && authForm && authTitle) {
                crudSection.style.display = "none";
                authForm.style.display = "block";
                authTitle.innerText = "Área de Administração - Iniciar Sessão";
            }
            logoutBtn.style.display = "none";
            if (authMessage) authMessage.innerText = "";
        } catch (error) {
            console.error("Erro ao terminar sessão:", error);
        }
    });
}

// Mostrar secções (modo antigo, se ainda usares)
function mostrarSecao(id) {
    document.querySelectorAll('main article').forEach(article => {
        article.style.display = 'none';
    });
    const alvo = document.getElementById(id);
    if (alvo) alvo.style.display = 'block';

    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick') === `mostrarSecao('${id}')`) {
            link.classList.add('active');
        }
    });
}
