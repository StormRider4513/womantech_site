document.addEventListener("DOMContentLoaded", function () {
    function includeHTML(id, file, callback) {
        fetch(file)
            .then(response => {
                if (!response.ok) throw new Error("Erro ao carregar " + file);
                return response.text();
            })
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (callback) callback();
            })
            .catch(error => console.error(error));
    }

    includeHTML("header", "partials/header.html", initScripts);
    includeHTML("footer", "partials/footer.html");
    includeHTML("card-projeto", "partials/card-projeto.html");

    function initScripts() {
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('bg-[#682857]', 'text-white');
                    btn.classList.add('bg-[#D3d3d3]', 'text-gray-700');
                });

                button.classList.remove('bg-[#D3d3d3]', 'text-gray-700');
                button.classList.add('bg-[#682857]', 'text-white');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                const contentId = button.id.replace('tab-', '') + '-content';
                document.getElementById(contentId)?.classList.add('active');
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });

                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });

        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.card, .team-card, .publication-card, .project-card');
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.2;

                if (elementPosition < screenPosition) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        document.querySelectorAll('.card, .team-card, .publication-card, .project-card').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.6s ease';
        });

        window.addEventListener('load', animateOnScroll);
        window.addEventListener('scroll', animateOnScroll);
    }

    function scrollLeft() {
        const container = document.querySelector('.overflow-x-auto');
        container.scrollBy({
            left: -500,
            behavior: 'smooth'
        });
    }

    function scrollRight() {
        const container = document.querySelector('.overflow-x-auto');
        container.scrollBy({
            left: 500,
            behavior: 'smooth'
        });
    }

    const leftButton = document.querySelector('.left-button');
    const rightButton = document.querySelector('.right-button');

    if (leftButton && rightButton) {
        leftButton.addEventListener('click', scrollLeft);
        rightButton.addEventListener('click', scrollRight);
    }

    const containerProjetos = document.getElementById("card-projeto");

    if (containerProjetos) {
        fetch('partials/card-projeto.html')
            .then(response => response.text())
            .then(html => {
                containerProjetos.innerHTML = html;
            })
            .catch(error => {
                console.error('Erro ao carregar os projetos:', error);
                containerProjetos.innerHTML = "<p>Não foi possível carregar os projetos no momento.</p>";
            });
    }

    const containerGrid = document.getElementById("todos-projetos-grid");

    if (containerGrid) {
        fetch('partials/card-projeto.html')
            .then(response => response.text())
            .then(html => {
                containerGrid.innerHTML = html;
            })
            .catch(error => {
                console.error('Erro ao carregar os projetos para o grid:', error);
                containerGrid.innerHTML = "<p>Não foi possível carregar os projetos.</p>";
            });
    }
});
