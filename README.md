# User Management Demo

## Українська версія

Односторінкова демонстраційна система керування користувачами. Frontend побудований на Bootstrap, jQuery і Ajax; backend — на Symfony, PHP, MySQL та Doctrine ORM. Усі операції з користувачами виконуються без перезавантаження сторінки.

### Вимоги

- PHP 8.2 або новіший з розширенням `pdo_mysql`;
- Composer;
- MySQL 8.0 або новіший;
- вебсервер з document root, що вказує на папку `public`, або вбудований PHP-сервер для локальної розробки.

### Встановлення та запуск

1. Встановіть PHP-залежності:

   ```powershell
   composer install
   ```

2. Створіть локальний файл конфігурації, якщо потрібно:

   ```powershell
   Copy-Item .env .env.local
   ```

3. Відкрийте `.env.local` і заповніть параметри підключення до MySQL:

   ```ini
   APP_ENV=dev
   APP_SECRET=dev_secret_change_me
   DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/user_management_demo?serverVersion=8.0&charset=utf8mb4"
   DEFAULT_URI=http://localhost
   ```

4. Створіть порожню базу даних, якщо її ще немає:

   ```sql
   CREATE DATABASE user_management_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. Підготуйте схему бази даних:

   ```powershell
   php bin/console doctrine:schema:update --force
   ```

6. Запустіть локальний сервер із папки проєкту:

   ```powershell
   php -S localhost:8000 -t public
   ```

7. Відкрийте [http://localhost:8000](http://localhost:8000) у браузері.

### Полезні команди

Перевірити стан підключення та налаштування Doctrine:

```powershell
php bin/console doctrine:database:import --help
```

Оновити схему після зміни сутності:

```powershell
php bin/console doctrine:schema:update --force
```

### API

| Метод | Шлях | Призначення |
| --- | --- | --- |
| `GET` | `/api/users` | Отримати список користувачів |
| `GET` | `/api/users/{id}` | Отримати одного користувача |
| `POST` | `/api/users` | Створити користувача |
| `PUT` | `/api/users/{id}` | Оновити користувача |
| `DELETE` | `/api/users/{id}` | Видалити користувача |
| `POST` | `/api/users/bulk-action` | Виконати масову дію |

Приклад тіла запиту для створення або редагування:

```json
{
  "name_first": "Test",
  "name_last": "User",
  "status": true,
  "role": "user"
}
```

Для масової дії передайте `action` (`set_active`, `set_not_active` або `delete`) та масив `ids`.

---

## English version

A one-page user-management demo. The frontend uses Bootstrap, jQuery, and Ajax; the backend uses Symfony, PHP, MySQL, and Doctrine ORM. All user operations run without page reloads.

### Requirements

- PHP 8.2 or newer with the `pdo_mysql` extension;
- Composer;
- MySQL 8.0 or newer;
- a web server whose document root points to `public`, or PHP's built-in server for local development.

### Installation and startup

1. Install PHP dependencies:

   ```powershell
   composer install
   ```

2. Create a local configuration file if needed:

   ```powershell
   Copy-Item .env .env.local
   ```

3. Open `.env.local` and enter your MySQL connection details:

   ```ini
   APP_ENV=dev
   APP_SECRET=dev_secret_change_me
   DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/user_management_demo?serverVersion=8.0&charset=utf8mb4"
   DEFAULT_URI=http://localhost
   ```

4. Create an empty database if it does not already exist:

   ```sql
   CREATE DATABASE user_management_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. Prepare the database schema:

   ```powershell
   php bin/console doctrine:schema:update --force
   ```

6. Start a local server from the project folder:

   ```powershell
   php -S localhost:8000 -t public
   ```

7. Open [http://localhost:8000](http://localhost:8000) in your browser.

### Useful commands

Check Doctrine configuration and schema:

```powershell
php bin/console doctrine:schema:update --force
```

### API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/{id}` | Get one user |
| `POST` | `/api/users` | Create a user |
| `PUT` | `/api/users/{id}` | Update a user |
| `DELETE` | `/api/users/{id}` | Delete a user |
| `POST` | `/api/users/bulk-action` | Run a bulk action |

Example request body for creating or updating a user:

```json
{
  "name_first": "Test",
  "name_last": "User",
  "status": true,
  "role": "user"
}
```

For a bulk operation, send `action` (`set_active`, `set_not_active`, or `delete`) and an `ids` array.
