
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const links = document.querySelectorAll('.nav-link');
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const newsletter = document.getElementById("newsletter-form");
const btn = document.getElementById("btn-onion");
const extra = document.querySelector(".onion-extra");

const imagensFundo = {
    intro: "images/image-header.jpg",
    mercados: "images/image-header.jpg",
    caso_real: "images/image-header.jpg",
    trabalho_policial: "images/image-header.jpg"
};

function carregarPagina(page) {
    fetch(`/${page}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            setupReadMore(); // reanexar eventos aos novos elementos
        })
        .catch(() => {
            document.getElementById("content").innerHTML =
                "<p>Erro ao carregar conteúdo.</p>";
        });
}

function atualizarImagemFundo(page) {
    const hero = document.querySelector(".hero");

    if (imagensFundo[page]) {
        hero.style.backgroundImage = `url('${imagensFundo[page]}')`;
    }
}

function navigateTo(page) {
    window.location.hash = page;
    carregarPagina(page);
    atualizarImagemFundo(page);
}

window.addEventListener("hashchange", () => {
    const page = location.hash.replace("#", "") || "intro";
    carregarPagina(page);
    atualizarImagemFundo(page);
});

// inicial
navigateTo("intro");



newsletter.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    if (email === "") return;

    // 1. Buscar array existente ou criar um novo
    let emails = JSON.parse(localStorage.getItem("newsletterEmails")) || [];

    // 2. Adicionar o novo email ao array
    emails.push(email);

    // 3. Guardar o array atualizado
    localStorage.setItem("newsletterEmails", JSON.stringify(emails));

    document.getElementById("newsletter-msg").textContent =
        "Obrigado! A tua subscrição foi registada.";

    // opcional: limpar input
    document.getElementById("email").value = "";
});

const savedEmail = localStorage.getItem("newsletterEmails");

if (savedEmail) {
    console.log("Email já guardado:", savedEmail);
}

function setupReadMore() {
    const boxes = document.querySelectorAll(".readmore-box");

    boxes.forEach(box => {
        const btn = box.querySelector(".btn-readmore");
        const extra = box.querySelector(".readmore-extra");

        btn.addEventListener("click", () => {
            const isHidden = extra.style.display === "none" || extra.style.display === "";

            extra.style.display = isHidden ? "block" : "none";
            btn.textContent = isHidden ? "Ler menos" : "Ler mais";
        });
    });
}

setupReadMore();

toggle.addEventListener('click', () => {
    menu.classList.toggle('show');
});

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
});

links.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
    });
});

// Destacar link ativo conforme scroll
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
