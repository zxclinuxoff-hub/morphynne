# Morphynne

Один репозиторий, один сайт на Render.

- `/` — основная био-страница (`index.html`, `style.css`, `script.js`, `avatar.jpg`)
- `/r/` — короткая ссылка, которая перенаправляет на основной сайт (`r/index.html`)

## Деплой
1. Загрузи все файлы из архива в корень репозитория GitHub (папка `r/` тоже).
2. В Render: **New → Blueprint** → выбери репозиторий. Render прочитает `render.yaml`.
   Либо **New → Static Site**, Publish Directory `.`, Build Command пустой.
3. Сайт откроется по адресу вида `https://morphynne.onrender.com`, короткая ссылка — `https://morphynne.onrender.com/r/`.

Если адрес сайта отличается от `morphynne.onrender.com`, поменяй его в `r/index.html` (в трёх местах).
