document.addEventListener("DOMContentLoaded", () => {
    // Carrega o cabeçalho e o rodapé compartilhados entre as páginas.
    async function loadPartial(id, path) {
        const target = document.getElementById(id);

        if (!target) return;

        try {
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`Falha ao carregar ${path}`);
            }

            target.innerHTML = await response.text();
        } catch (error) {
            console.error(error);

            target.innerHTML = `
        <p class="load-error">
          Não foi possível carregar este componente.
          Abra o projeto usando o Live Server do VS Code.
        </p>
      `;
        }
    }

    // Carrega o cabeçalho e o rodapé.
    Promise.all([
        loadPartial("header", "partials/header.html"),
        loadPartial("footer", "partials/footer.html")
    ]).then(() => {
        // Marca a página atual no menu.
        const nav = document.querySelector(".site-nav");

        if (nav) {
            const currentPage =
                location.pathname.split("/").pop() || "index.html";

            nav.querySelectorAll("a").forEach(link => {
                if (link.getAttribute("href") === currentPage) {
                    link.setAttribute("aria-current", "page");
                }
            });
        }

        // Atualiza o ano do rodapé.
        const year = document.getElementById("current-year");

        if (year) {
            year.textContent = new Date().getFullYear();
        }
    });

    // Menu responsivo.
    // A delegação permite que o clique funcione mesmo depois
    // que o cabeçalho for carregado com fetch().
    document.addEventListener("click", event => {
        const target =
            event.target instanceof Element ? event.target : null;

        if (!target) return;

        const toggle = target.closest(".menu-toggle");

        if (toggle) {
            const controlledId = toggle.getAttribute("aria-controls");

            const nav =
                (controlledId && document.getElementById(controlledId)) ||
                toggle.parentElement?.querySelector(".site-nav") ||
                document.querySelector(".site-nav");

            if (!nav) {
                console.error(
                    "Menu WomanTech: navegação .site-nav não encontrada."
                );
                return;
            }

            const isOpen = !nav.classList.contains("is-open");

            nav.classList.toggle("is-open", isOpen);

            toggle.setAttribute("aria-expanded", String(isOpen));

            toggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Fechar menu de navegação"
                    : "Abrir menu de navegação"
            );

            return;
        }

        // Fecha o menu quando uma opção é selecionada.
        const navLink = target.closest(".site-nav a");

        if (navLink) {
            const nav = navLink.closest(".site-nav");
            const toggleButton = document.querySelector(".menu-toggle");

            nav?.classList.remove("is-open");

            toggleButton?.setAttribute("aria-expanded", "false");
            toggleButton?.setAttribute(
                "aria-label",
                "Abrir menu de navegação"
            );
        }
    });

    // Fecha o menu com a tecla Esc.
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        const nav = document.querySelector(".site-nav");
        const toggle = document.querySelector(".menu-toggle");

        nav?.classList.remove("is-open");

        toggle?.setAttribute("aria-expanded", "false");
        toggle?.setAttribute(
            "aria-label",
            "Abrir menu de navegação"
        );
    });

    // =========================================================
    // FILTROS DA EQUIPE
    // =========================================================

    const teamCategoryButtons = document.querySelectorAll(
        "[data-team-category][type='button']"
    );

    const teamCards = document.querySelectorAll(
        ".coordinator-card[data-team-category], #people-grid .person-card"
    );

    const teamSemester = document.getElementById("team-semester");

    let selectedTeamCategory = "all";

    function filterTeam() {
        const semester = teamSemester?.value || "all";

        teamCards.forEach(card => {
            const category = card.dataset.teamCategory;
            const cardSemester = card.dataset.semester || "all";

            const categoryOk =
                selectedTeamCategory === "all" ||
                category === selectedTeamCategory ||
                (
                    selectedTeamCategory === "bolsistas" &&
                    category === "voluntarias"
                ) ||
                (
                    selectedTeamCategory === "professoras" &&
                    card.classList.contains("coordinator-card")
                );

            const semesterOk =
                semester === "all" ||
                cardSemester === semester ||
                (
                    card.classList.contains("coordinator-card") &&
                    semester === "2026-2"
                );

            card.hidden = !(categoryOk && semesterOk);
        });

        const visiblePeople = [
            ...document.querySelectorAll("#people-grid .person-card")
        ].filter(card => !card.hidden);

        const count = document.getElementById("team-count");

        if (count) {
            if (selectedTeamCategory === "professoras") {
                count.textContent = "6 professoras";
            } else if (selectedTeamCategory === "coordenacao") {
                count.textContent = "1 coordenação";
            } else {
                count.textContent =
                    `${visiblePeople.length} ` +
                    (
                        visiblePeople.length === 1
                            ? "integrante"
                            : "integrantes"
                    );
            }
        }
    }

    teamCategoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedTeamCategory = button.dataset.teamCategory;

            if (
                selectedTeamCategory === "former" &&
                teamSemester
            ) {
                teamSemester.value = "all";
            }

            teamCategoryButtons.forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);

                item.setAttribute("aria-pressed", String(active));
            });

            filterTeam();
        });
    });

    teamSemester?.addEventListener("change", filterTeam);

    if (teamCards.length) {
        filterTeam();
    }

    // =========================================================
    // FILTROS DE PROJETOS E EVENTOS
    // =========================================================

    const projectSemesterButtons = document.querySelectorAll(
        "[data-project-semester]"
    );

    const projectCards = document.querySelectorAll(
        "#project-grid .project-card"
    );

    const projectTypeInputs = document.querySelectorAll(
        "[data-project-type]"
    );

    let selectedProjectSemester = "all";

    function filterProjects() {
        const types = [
            ...projectTypeInputs
        ]
            .filter(input => input.checked)
            .map(input => input.value);

        projectCards.forEach(card => {
            const semesterOk =
                selectedProjectSemester === "all" ||
                card.dataset.projectSemester === selectedProjectSemester;

            const typeOk = types.includes(card.dataset.projectType);

            card.hidden = !(semesterOk && typeOk);
        });

        const count = [
            ...projectCards
        ].filter(card => !card.hidden).length;

        const output = document.getElementById("project-count");

        if (output) {
            output.textContent =
                `${count} ${count === 1 ? "registro" : "registros"}`;
        }
    }

    projectSemesterButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedProjectSemester = button.dataset.projectSemester;

            projectSemesterButtons.forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            filterProjects();
        });
    });

    projectTypeInputs.forEach(input => {
        input.addEventListener("change", filterProjects);
    });

    // =========================================================
    // BUSCA E FILTROS DOS CURSOS
    // =========================================================

    const courseSearch = document.getElementById("course-search");

    const courseCards = [
        ...document.querySelectorAll("#course-grid .course-card")
    ];

    const courseLevelButtons = document.querySelectorAll(
        "[data-course-level]"
    );

    let selectedCourseLevel = "all";

    function filterCourses() {
        const query = (courseSearch?.value || "")
            .trim()
            .toLocaleLowerCase("pt-BR");

        courseCards.forEach(card => {
            const levels = (card.dataset.courseLevels || "")
                .split(" ");

            const text = (
                `${card.dataset.courseSearch || ""} ${card.innerText}`
            ).toLocaleLowerCase("pt-BR");

            const levelOk =
                selectedCourseLevel === "all" ||
                levels.includes(selectedCourseLevel);

            card.hidden = !(levelOk && text.includes(query));
        });

        const hasVisibleCourses = courseCards.some(
            card => !card.hidden
        );

        const empty = document.getElementById("course-empty");

        if (empty) {
            empty.hidden = hasVisibleCourses;
        }
    }

    courseSearch?.addEventListener("input", filterCourses);

    courseLevelButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedCourseLevel = button.dataset.courseLevel;

            courseLevelButtons.forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            filterCourses();
        });
    });

    if (courseCards.length) {
        filterCourses();
    }

    // =========================================================
    // PORTAL DE CARREIRA
    // =========================================================

    const careerList = document.getElementById("career-list");

    if (careerList) {
        const jobs = [
            ...careerList.querySelectorAll(".job-card")
        ];

        const careerSearch = document.getElementById("career-search");
        const careerCity = document.getElementById("career-city");
        const affirmative = document.getElementById("career-affirmative");
        const sort = document.getElementById("career-sort");
        const feedback = document.getElementById("career-feedback");

        const levelOrder = {
            aprendiz: 1,
            estagio: 2,
            junior: 3,
            pleno: 4,
            senior: 5
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        function isJobActive(job) {
            const deadline = new Date(
                `${job.dataset.deadline}T00:00:00`
            );

            return !Number.isNaN(deadline.getTime()) &&
                deadline >= today;
        }

        function checkedValues(selector) {
            return [
                ...document.querySelectorAll(selector)
            ]
                .filter(input => input.checked)
                .map(input => input.value);
        }

        // Prepara prazos e favoritos demonstrativos.
        jobs.forEach(job => {
            const deadline = new Date(
                `${job.dataset.deadline}T00:00:00`
            );

            const label = job.querySelector("[data-deadline-label]");

            if (label && !Number.isNaN(deadline.getTime())) {
                label.textContent =
                    `Até ${deadline.toLocaleDateString("pt-BR")}`;
            }

            const title = job.dataset.title || "vaga";
            const favoriteKey = `womantech-fav:${title}`;

            let favorite = false;

            try {
                favorite = localStorage.getItem(favoriteKey) === "1";
            } catch (error) {
                console.warn("Não foi possível consultar favoritos.", error);
            }

            const button = job.querySelector(".save-job");

            if (button) {
                button.classList.toggle("is-saved", favorite);
                button.setAttribute("aria-pressed", String(favorite));
                button.textContent = favorite ? "♥" : "♡";
            }

            if (!isJobActive(job)) {
                job.hidden = true;
            }
        });

        function filterCareer() {
            const query = (careerSearch?.value || "")
                .trim()
                .toLocaleLowerCase("pt-BR");

            const city = (careerCity?.value || "")
                .trim()
                .toLocaleLowerCase("pt-BR");

            const levels = checkedValues("[data-career-level]");
            const areas = checkedValues("[data-career-area]");
            const modalities = checkedValues("[data-career-modality]");

            jobs.forEach(job => {
                const searchable = (
                    `${job.dataset.title || ""} ` +
                    `${job.dataset.employer || ""} ` +
                    `${job.dataset.text || ""} ` +
                    `${job.dataset.city || ""}`
                ).toLocaleLowerCase("pt-BR");

                const matches =
                    isJobActive(job) &&
                    searchable.includes(query) &&
                    (job.dataset.city || "")
                        .toLocaleLowerCase("pt-BR")
                        .includes(city) &&
                    (
                        !levels.length ||
                        levels.includes(job.dataset.level)
                    ) &&
                    (
                        !areas.length ||
                        areas.includes(job.dataset.area)
                    ) &&
                    (
                        !modalities.length ||
                        modalities.includes(job.dataset.modality)
                    ) &&
                    (
                        !affirmative?.checked ||
                        job.dataset.affirmative === "true"
                    );

                job.hidden = !matches;
            });

            const visibleJobs = jobs.filter(job => !job.hidden);
            const order = sort?.value || "deadline";

            visibleJobs.sort((a, b) => {
                if (order === "title") {
                    return (a.dataset.title || "").localeCompare(
                        b.dataset.title || "",
                        "pt-BR"
                    );
                }

                if (order === "level") {
                    return (
                        (levelOrder[a.dataset.level] || 99) -
                        (levelOrder[b.dataset.level] || 99)
                    );
                }

                return (a.dataset.deadline || "").localeCompare(
                    b.dataset.deadline || ""
                );
            });

            visibleJobs.forEach(job => {
                careerList.appendChild(job);
            });

            const count = document.getElementById(
                "career-result-count"
            );

            if (count) {
                count.textContent =
                    `${visibleJobs.length} ` +
                    (
                        visibleJobs.length === 1
                            ? "vaga demonstrativa"
                            : "vagas demonstrativas"
                    );
            }

            const empty = document.getElementById("career-empty");

            if (empty) {
                empty.hidden = visibleJobs.length > 0;
            }
        }

        const careerInputs = [
            careerSearch,
            careerCity,
            affirmative,
            sort,
            ...document.querySelectorAll(
                "[data-career-level], " +
                "[data-career-area], " +
                "[data-career-modality]"
            )
        ].filter(Boolean);

        careerInputs.forEach(input => {
            input.addEventListener("input", filterCareer);
            input.addEventListener("change", filterCareer);
        });

        // Limpa todos os filtros.
        document.getElementById("career-reset")
            ?.addEventListener("click", () => {
                if (careerSearch) careerSearch.value = "";
                if (careerCity) careerCity.value = "";
                if (affirmative) affirmative.checked = false;
                if (sort) sort.value = "deadline";

                document.querySelectorAll(
                    "[data-career-level], " +
                    "[data-career-area], " +
                    "[data-career-modality]"
                ).forEach(input => {
                    input.checked = false;
                });

                filterCareer();
            });

        // Favoritos e botões de candidatura demonstrativos.
        careerList.addEventListener("click", event => {
            const target =
                event.target instanceof Element ? event.target : null;

            if (!target) return;

            const favoriteButton = target.closest(".save-job");
            const applyButton = target.closest(".apply-job");

            if (favoriteButton) {
                const job = favoriteButton.closest(".job-card");

                if (!job) return;

                const title = job.dataset.title || "vaga";
                const key = `womantech-fav:${title}`;

                const save =
                    favoriteButton.getAttribute("aria-pressed") !== "true";

                try {
                    if (save) {
                        localStorage.setItem(key, "1");
                    } else {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    console.warn("Não foi possível salvar o favorito.", error);
                }

                favoriteButton.setAttribute("aria-pressed", String(save));
                favoriteButton.classList.toggle("is-saved", save);
                favoriteButton.textContent = save ? "♥" : "♡";

                if (feedback) {
                    feedback.textContent = save
                        ? "Favorito salvo neste navegador. Na versão final, será associado à conta da aluna."
                        : "Favorito removido deste navegador.";
                }
            }

            if (applyButton && feedback) {
                feedback.textContent =
                    "Esta é uma vaga demonstrativa. O link oficial de candidatura será cadastrado quando o portal for integrado.";
            }
        });

        filterCareer();
    }

    // =========================================================
    // TELA DE LOGIN DEMONSTRATIVA
    // =========================================================

    const loginForm = document.getElementById("demo-login-form");
    const loginFeedback = document.getElementById("login-feedback");

    let loginRole = "aluna";

    document.querySelectorAll("[data-login-role]").forEach(button => {
        button.addEventListener("click", () => {
            loginRole = button.dataset.loginRole;

            document.querySelectorAll("[data-login-role]").forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });
        });
    });

    // Não envia nem armazena credenciais nesta versão.
    loginForm?.addEventListener("submit", event => {
        event.preventDefault();

        if (loginFeedback) {
            loginFeedback.textContent =
                `Acesso de ${loginRole} ainda não está ativo. ` +
                "A autenticação será integrada ao Supabase nas próximas fases.";
        }
    });

    document.getElementById("create-account")
        ?.addEventListener("click", event => {
            event.preventDefault();

            if (loginFeedback) {
                loginFeedback.textContent =
                    "O cadastro será disponibilizado após a integração de autenticação e do aviso para responsáveis de menores.";
            }
        });

    document.getElementById("forgot-password")
        ?.addEventListener("click", event => {
            event.preventDefault();

            if (loginFeedback) {
                loginFeedback.textContent =
                    "A recuperação de senha será configurada quando a autenticação estiver ativa.";
            }
        });
});