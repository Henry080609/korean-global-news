const http = require("http");
const fs = require("fs");
const Parser = require("rss-parser");
const cheerio = require("cheerio");

const parser = new Parser();

async function getArticleText(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);

        $("script, style, nav, footer").remove();

        return $("body").text().replace(/\s+/g, " ").trim();
    } catch (error) {
        console.error("Failed to get article:", error);
        return "";
    }
}

async function summarizeArticle(text) {
    return "이 기사는 국제 사회에서 발생한 주요 사건과 그 영향을 다루고 있습니다.";
}

let news = [];

async function loadNews() {
    try {
        const feed = await parser.parseURL(
            "https://feeds.bbci.co.uk/news/world/rss.xml"
        );

        news = feed.items.slice(0, 10).map(article => ({
            source: "BBC",
            category: "World",
            title: article.title,
            summary: "한국어 요약이 아직 없습니다.",
            time: article.pubDate,
            link: article.link
        }));

        console.log("BBC news loaded:", news.length);
    } catch (error) {
        console.error("Failed to load BBC news:", error);
    }
}

loadNews();

const server = http.createServer((req, res) => {

    // Summarize first BBC article
    if (req.url === "/api/summarize") {
        const articleUrl = news[0]?.link;

        getArticleText(articleUrl).then(text => {
            return summarizeArticle(text);
        }).then(summary => {
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8"
            });

            res.end(JSON.stringify({
                summary: summary
            }));
        });

        return;
    }

    // Test article extraction
    if (req.url === "/api/test-article") {
        const articleUrl = news[0]?.link;

        getArticleText(articleUrl).then(text => {
            res.writeHead(200, {
                "Content-Type": "text/plain; charset=utf-8"
            });

            res.end(text);
        });

        return;
    }

    // News API
    if (req.url === "/api/news") {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        });

        res.end(JSON.stringify(news));
        return;
    }

    // Website files
    let file = "index.html";
    let contentType = "text/html";

    if (req.url === "/style.css") {
        file = "style.css";
        contentType = "text/css";
    }

    if (req.url === "/script.js") {
        file = "script.js";
        contentType = "application/javascript";
    }

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Not Found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(data);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});