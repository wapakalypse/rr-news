
const express = require('express');
const app = express();
const fs = require('fs'); // this engine requires the fs module
const cheerio = require('cheerio');
const axios = require('axios');

app.engine('ntl', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    var rendered = content.toString()
    .replace('#posts#', ''+ options.posts +'')
    return callback(null, rendered);
  });
});

app.set('views', './views'); // specify the views directory
app.set('view engine', 'ntl'); // register the template engine

app.use(express.static(__dirname + '/public'));

const url = 'https://www.autostat.ru/tags/3054/'

app.get('/', function (req, res) {

    async function getData(id) {

        var links = [];
            posts = '';

        let body = await axios.get("https://www.autostat.ru/tags/3054");
        const $ = cheerio.load(body.data);

        $('li.news_item').each(function () {
            let href = $(this)
            .find('a')
            .attr('href')

            links.push('https://www.autostat.ru'+ href);

        });

        for (let index = 0; index < links.length; ++index) {
            let body2 = await axios.get(links[index]);

            const $$ = cheerio.load(body2.data);

            let title = $$('h1.news_title').text()

            let image = $$('.text--big-photo img').attr('src')  

        //    let summary = $$('div.inner_content p').first().text();

            let text = $$('div.inner_content').html();

            let link = links[index];

            posts += `  <div class="content-news" id="news${index}">
                            <h2>${title}</h2>
                            <div class="content-news-text">
                                <img class="content-news-image" src="https://www.autostat.ru${image}" />
                                ${text}
                            </div>
                            <div class="content-news-buttons">
                                <button id="${index}" class="content-news-more">Читать полностью</button>
                                <a class="content-news-link" href="${link}" target="_blank">Источник</a>
                            </div>
                        </div> <hr />`;
        }

        res.render('index', {posts: posts});


    }

    getData();

});


app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`)
})