CREATE TABLE empleadores (
    id SERIAL PRIMARY KEY, -- Campo auto incremental para identificar unívocamente a cada empleador
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_cuenta VARCHAR(50) NOT NULL,
    cedula_ruc BIGINT NOT NULL UNIQUE, -- Usamos BIGINT para cedula o RUC, y un campo único para evitar duplicados
    email VARCHAR(255) NOT NULL UNIQUE, -- El email debe ser único
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    ciudad VARCHAR(100),
    foto_perfil TEXT, -- Usamos TEXT por si la foto es una URL larga o base64
    direccion TEXT,
    contrasena TEXT, -- La contraseña, que debe ser segura y almacenada de forma cifrada
    edad INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de última actualización
);

-- Crear índices para optimizar las búsquedas
CREATE INDEX idx_cedula_ruc ON empleadores (cedula_ruc);
CREATE INDEX idx_email_empleadores ON empleadores (email);
CREATE INDEX idx_telefono_empleadores ON empleadores (telefono);
CREATE INDEX idx_ciudad_empleadores ON empleadores (ciudad);







  CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY, -- Campo auto incremental para identificar unívocamente a cada estudiante
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    tipo_cuenta VARCHAR(50) NOT NULL,
    cedula BIGINT NOT NULL UNIQUE, -- Usamos BIGINT por si hay un rango grande de números
    email VARCHAR(255) NOT NULL UNIQUE, -- El email debe ser único
    telefono VARCHAR(20),
    institucion_educativa VARCHAR(255),
    fecha_nacimiento DATE,
    direccion TEXT,
    edad INTEGER,
    ciudad VARCHAR(100),
    carrera VARCHAR(100),
    nivel_actual VARCHAR(50),
    foto_de_carnet TEXT, -- Usamos TEXT por si la foto es una URL larga o base64
    universidad VARCHAR(255),
    habilidades_basicas TEXT[], -- Array de habilidades, si quieres almacenar múltiples habilidades
    disponibilidad_de_tiempo BOOLEAN, -- Para indicar si el estudiante está disponible
    contrasena TEXT, -- La contraseña, que debe ser segura y almacenada de forma cifrada
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de última actualización
);

-- Crear índices para optimizar las búsquedas
CREATE INDEX idx_cedula ON estudiantes (cedula);
CREATE INDEX idx_email ON estudiantes (email);
CREATE INDEX idx_telefono ON estudiantes (telefono);
CREATE INDEX idx_ciudad ON estudiantes (ciudad);
CREATE INDEX idx_carrera ON estudiantes (carrera);
CREATE INDEX idx_universidad ON estudiantes (universidad); -- Índice añadido para 'universidad'

