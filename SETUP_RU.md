# PoRE Smartphone as IoT — пошаговая настройка

## Цель

Выполнить ровно три требования преподавателя: (1) телефон выступает IoT-датчиком, (2) передаёт данные в облако, (3) веб-страница отображает полученную телеметрию.

Требуется iPhone с Safari, ноутбук, Firebase Console, GitHub Pages. **Не нужен** Android Studio, Azure или платный тариф.

## 1. Firebase: подключение веб-приложения

Можно использовать уже существующий проект **MADT-Lab6-WeatherMap**, где включён Email/Password Authentication. Это не затрагивает Android Lab 6, если не изменять его настройки авторизации.

1. Перейди в https://console.firebase.google.com/ и открой Firebase-проект.
2. Рядом с названием проекта открой настройки (шестерёнка → Project settings).
3. Пролистай до **Your apps** и нажми значок **Web** (`</>`).
4. Название приложения: `PoRE Smartphone IoT`.
5. Firebase Hosting сейчас **не включай**, будем использовать GitHub Pages.
6. После регистрации получишь блок `const firebaseConfig = { ... }`. Скопируй значения в одноимённые поля файла `firebase-config.js`.
7. Проверь, что в Firebase Console > Authentication > Sign-in method включено **Email/Password**. Если используешь прежний проект Lab 6, оно уже включено.

**Важное:** файл `google-services.json` от Android здесь не используется. Не прикладывай Admin SDK private key и чужие пароли.

## 2. Включение Cloud Firestore

1. В Firebase Console открой **Build/Databases & Storage → Firestore Database**.
2. Нажми **Create database**. Для короткого проекта выбери доступную бесплатную базу в ближайшем европейском регионе и **Production mode**.
3. Открой вкладку **Rules**.
4. Полностью замени правила содержимым прилагаемого `firestore.rules` и нажми **Publish**.
5. Вернись во вкладку **Data**. Коллекции вручную создавать не нужно — они появятся после первого успешного измерения.

**Нельзя оставлять** правила `allow read, write: if true`. Наша модель ограничивает доступ каждым Firebase UID.

## 3. Публикация веб-сайта

1. Создай новый **public** репозиторий GitHub, например `PoRE-Smartphone-IoT`.
2. Загрузить все файлы из этой папки в **корень** репозитория. Обязательно: `index.html`, `phone.html`, `dashboard.html`, `.js`, `.mjs`, `styles.css`, `firebase-config.js`.
3. Открой Settings → Pages → **Build and deployment** → Source: `Deploy from a branch` → Branch `main`, Folder `/ (root)` → Save.
4. После появления HTTPS-адреса открой главную страницу. Пример: `https://username.github.io/PoRE-Smartphone-IoT/`.
5. Дополнительно в Firebase Authentication > Settings > Authorized domains проверь домен `username.github.io`, если вход блокируется доменными ограничениями. Email/Password обычно не требует OAuth redirect, однако настройка домена полезна для совместимости.

Публикация исходников в публичном репозитории допустима, если внутри только Firebase **Web app config** и действуют строгие Firestore rules. Секретные приватные ключи публиковать нельзя.

## 4. Проверка настоящего IoT-сценария

1. На iPhone 13 открой **Safari**, затем страницу `/phone.html`.
2. Используй тестовый email и отдельный пароль (лучше не университетский и не личный).
3. Нажми **Create account** в первый раз. Потом — **Sign in**.
4. Нажми **Allow sensors & start** именно кнопкой. Если Safari запросит разрешение «Motion & Orientation Access», согласись.
5. Немного поворачивай телефон. Значение Acceleration должно изменяться.
6. Держи Safari открытым на экране: каждые 2 секунды приложение отправляет пакет в Firestore, максимум 120 за сеанс.
7. На ноутбуке открой `/dashboard.html`, войди **в тот же тестовый аккаунт**.
8. Проверь обновление количества записей, двух графиков, таблицы и временных меток.
9. Нажми **Stop** на телефоне; убедись, что новые записи больше не отправляются.
10. В Firebase Console можно открыть `devices → [UID] → readings`, чтобы подтвердить облачное хранение.

Если гироскоп недоступен в Safari, его показатель будет «—»; акселерометр достаточно удовлетворяет пункту `gyro, battery level or similar` по тексту задания. Для более полного показа попробуй Safari напрямую, не встроенный браузер мессенджера.

## 5. Что сдавать

Если Moodle позволяет прикладывать файлы:

- `PoRE_Smartphone_IoT.zip` — исходный код с Firebase client config (но **без** паролей и ключей Admin SDK);
- `SUBMISSION_LINKS.txt` — ссылки на GitHub, dashboard, телефонный sender;
- 2–3 скриншота: sender с реальными измерениями, dashboard с графиками, Firebase Firestore с записью.

Если преподавателю нужен живой просмотр, предоставь тестовые данные для входа **в приватном сообщении**, а не в публичном репозитории.

## Troubleshooting

- `Firebase not configured` → не заполнен `firebase-config.js`.
- `permission-denied` → не опубликованы правила, вход выполнен не в ту учётную запись, либо не создана Firestore Database.
- Датчики не обнаружены → открой HTTPS сайт в Safari, нажми разрешение после кнопки, проверь Settings > Safari > Motion & Orientation Access.
- Dashboard пустой → телефон ничего не отправил, другое Firebase UID или Firestore не настроен.
- `No acceleration data` → браузер не отдаёт `devicemotion`; не подменяй это синтетическими значениями.
- Две разные учётные записи на телефоне и ноутбуке → статистика не будет общей по причине защитных правил.
