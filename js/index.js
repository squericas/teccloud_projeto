
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const links = document.querySelectorAll('.nav-link');
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const newsletter = document.getElementById("newsletter-form");

const btn = document.getElementById("btn-onion");
const extra = document.querySelector(".onion-extra");

newsletter.addEventListener("submit", function (e) {
    e.preventDefault(); // impede o reload da página
    
    const email = document.getElementById("email").value;

    if (email.trim() === "") return;

    // guardar no localStorage
    localStorage.setItem("newsletterEmail", email);

    document.getElementById("newsletter-msg").textContent =
        "Obrigado! A tua subscrição foi registada.";
});

const savedEmail = localStorage.getItem("newsletterEmail");

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
