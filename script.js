console.log("SCRIPT IS RUNNING");

fetch("/api/news")
    .then(response => response.json())
    .then(news => {
        const container = document.querySelector(".news-container");

        news.forEach(article => {
            container.innerHTML += `
                <article class="news-card">
                    <p class="source">${article.source} · ${article.category}</p>
                    <h2>${article.title}</h2>
                    <p>${article.summary}</p>
                    <p class="time">${article.time}</p>
                    <a href="${article.link}" target="_blank">
                        Read original article →
                    </a>
                </article>
            `;
        });
    });