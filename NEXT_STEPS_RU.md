# Следующие действия (Firebase уже настроен)

На 21 ноября 2026 пользователь зарегистрировал Firebase Web App, создал Cloud Firestore `(default)` в production mode и опубликовал правила из `firestore.rules`. Авторизация Email/Password была включена ранее для MADT Lab 6.

`firebase-config.js` в этом комплекте уже заполнен по скриншоту Firebase Web App, который пользователь прислал в чат. Сверь его с Project settings → Your apps при возникновении ошибки API key.

## Опубликовать веб-интерфейс

1. Войти на GitHub, создать публичный пустой репозиторий `PoRE-Smartphone-IoT`.
2. Загрузить содержимое папки `PoRE_Smartphone_IoT` **в корень** репозитория: `index.html`, `phone.html`, `dashboard.html`, JS-модули, `styles.css` и остальные файлы. Не загружать ZIP как единственный файл.
3. Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
4. Открыть `https://<имя>.github.io/PoRE-Smartphone-IoT/dashboard.html`.
5. Войти под тестовым Firebase Email/Password аккаунтом из проекта или создать отдельный. Не публиковать его пароль.
6. Дашборд без показаний должен писать `Connected — waiting for smartphone readings`.

## Что важно без телефона

На компьютере можно проверить авторизацию, связь dashboard с Firestore и интерфейс. Однако реальная телеметрия с физического смартфона пока не проверена, а эмулятор не обязательно предоставляет DeviceMotion API браузеру. Нельзя выдавать выдуманные измерения за настоящие. Полное выполнение требования *Smartphone as IoT* потребуется подтвердить на реальном смартфоне либо поддерживаемом эмуляторе с явно оговорёнными ограничениями.

## Безопасность

Firebase Web API key в `firebase-config.js` не является приватным ключом. Не публикуй Firebase Admin SDK/service account credentials. Доступ к показаниям должен ограничиваться Firestore Rules и Firebase Auth. Не меняй настройки существующего Android Lab 6.
