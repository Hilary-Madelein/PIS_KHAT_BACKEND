# PIS_KHAT_BACKEND

Este es el repositorio del backend desarrollado con Node.js y MySQL para el proyecto KHAT-TF. A continuación, encontrarás instrucciones para clonar el repositorio, instalar las dependencias necesarias, configurar la base de datos y cómo levantar el proyecto.

## Clonar el Repositorio

Para comenzar, clona este repositorio en tu máquina local utilizando el siguiente comando:

```bash
git clone https://github.com/Hilary-Madelein/PIS_KHAT_BACKEND.git
```

## Instalar Dependencias

Una vez que hayas clonado el repositorio, navega al directorio del proyecto y ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
cd PIS_KHAT_BACKEND/khat_tf2
npm install
```

Este comando instalará todas las dependencias necesarias definidas en el archivo `package.json`.

## Configurar la Base de Datos

Antes de ejecutar el proyecto, asegúrate de configurar la base de datos. Sigue estos pasos:

1. Inicia sesión en MySQL con un usuario que tenga privilegios de administrador utilizando el siguiente comando y luego ingresa la contraseña del usuario:

    ```bash
    mysql -u root -p
    ```

2. Una vez que hayas ingresado a MySQL, ejecuta el siguiente comando para crear un nuevo usuario y asignarle todos los privilegios:

    ```sql
    CREATE USER 'desarrollo'@'localhost' IDENTIFIED BY 'desarrollo';
    GRANT ALL PRIVILEGES ON *.* TO 'desarrollo'@'localhost' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
    exit;
    ```

3. Luego, ingresa a MySQL con el nuevo usuario creado:

    ```bash
    mysql -h 127.0.0.1 -u desarrollo -p
    ```

4. Crea la base de datos `khat_pis` ejecutando el siguiente comando:

    ```sql
    CREATE DATABASE khat_pis;
    ```

5. Ahora, asegúrate de estar en la carpeta `PIS_KHAT_BACKEND/khat_tf2/` y luego levanta el proyecto con el siguiente comando:

    ```bash
    npm start
    ```

6. Para crear las tablas necesarias en la base de datos, accede a [http://localhost:3000/privado/NOCHE_555](http://localhost:3000/privado/NOCHE_555). Cuando veas un mensaje que diga "OK!", significa que la configuración de la base de datos ha sido exitosa.

7. Para completar la configuración de la base de datos, ejecuta los siguientes comandos SQL para insertar roles, personas, asociar personas y roles, insertar cuentas, insertar periodo, e insertar ciclo:

    ```sql

    USE khat_pis;

    START TRANSACTION;

    -- Insertar roles
    INSERT INTO rol (external_id, estado, tipo, createdAt, updatedAt) 
    VALUES 
    (UUID(), 1, 'ADMINISTRADOR', NOW(), NOW()),
    (UUID(), 1, 'ESTUDIANTE', NOW(), NOW()),
    (UUID(), 1, 'DOCENTE', NOW(), NOW());

    -- Insertar personas
    INSERT INTO persona (external_id, estado, foto, nombres, apellidos, tipo_identificacion, identificacion, fecha_nacimiento, telefono, direccion, createdAt, updatedAt) 
    VALUES 
    (UUID(), 1, '4844b8f5-1b7b-4051-a2d2-1b266bfb122a.jpeg', 'Gisseth', 'Freire', 'CEDULA', '1234567890', '1990-05-15 00:00:00', '+1234567890', '123 Main St, City', '2023-01-01 12:00:00', '2023-01-01 12:00:00'),
    (UUID(), 1, 'f4c4c1d2-19a1-4a24-9d0a-ed72c96403ce.jpeg', 'Karen', 'Gonzaga', 'CEDULA', '1234567899', '1985-10-20 00:00:00', '+1234567890', '456 Oak St, Town', '2023-01-02 12:00:00', '2023-01-02 12:00:00'),
    (UUID(), 1, 'b7537423-ce52-40ce-9b13-e0244ae3c3cb.jpeg', 'Hilary', 'Calva', 'CEDULA', '9876543210', '1975-03-08 00:00:00', '+1234567890', '789 Elm St, Village', '2023-01-03 12:00:00', '2023-01-03 12:00:00');

    -- Asociar personas y roles
    INSERT INTO persona_rol (external_id, estado, createdAt, updatedAt, id_persona, id_rol) 
    VALUES 
    (UUID(), 1, NOW(), NOW(), 2, 1),
    (UUID(), 1, NOW(), NOW(), 1, 2),
    (UUID(), 1, NOW(), NOW(), 3, 3);

    -- Insertar cuentas
    INSERT INTO cuenta (external_id, correo, clave, createdAt, updatedAt, id_persona) 
    VALUES 
    (UUID(), 'ejemplo1@example.com', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', NOW(), NOW(), 2),
    (UUID(), 'ejemplo2@example.com', '$2a$08$fcwN5ZVZFGvsNNori5hmL.3zeqzD.KCsdxeGs3bDcPu3iZLwNs8Dq', NOW(), NOW(), 1),
    (UUID(), 'ejemplo3@example.com', '$2a$08$R5h9MrtZdNl7s26E2gkOC.k5nxXIhpD5qbpB2l5a0HXl1THYoVQ2O', NOW(), NOW(), 3);

    -- Insertar periodo
    INSERT INTO periodo (external_id, estado, comienzo, culminacion, createdAt, updatedAt)
    VALUES (UUID(), 1, '2024-01-01', '2024-06-30', NOW(), NOW());

    -- Insertar ciclo
    INSERT INTO ciclo (external_id, estado, numero_ciclo, createdAt, updatedAt) 
    VALUES
    (UUID(), 1, 1, NOW(), NOW()),
    (UUID(), 1, 2, NOW(), NOW()),
    (UUID(), 1, 3, NOW(), NOW()),
    (UUID(), 1, 4, NOW(), NOW()),
    (UUID(), 1, 5, NOW(), NOW()),
    (UUID(), 1, 6, NOW(), NOW()),
    (UUID(), 1, 7, NOW(), NOW()),
    (UUID(), 1, 8, NOW(), NOW()),
    (UUID(), 1, 9, NOW(), NOW()),
    (UUID(), 1, 10, NOW(), NOW());

    COMMIT;
    ```

Una vez completados estos pasos, la base de datos estará configurada correctamente para su correcto funcionamiento.
### Cuentas de Acceso

| Correo               | Contraseña | Rol           |
|----------------------|------------|---------------|
| ejemplo1@example.com | clave123   | Administrador |
| ejemplo2@example.com | clave456   | Estudiante    |
| ejemplo3@example.com | clave789   | Docente       |

Podrás acceder al sistema utilizando las cuentas proporcionadas.

¡Ahora estás listo para utilizar el backend de KHAT-TF! Si tienes alguna pregunta o encuentras algún problema, no dudes en comunicarte con el equipo de desarrollo.

¡Disfruta trabajando con KHAT-TF! 🚀