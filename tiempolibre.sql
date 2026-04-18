-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 15-02-2026 a las 11:38:28
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tiempolibre`
--

-- --------------------------------------------------------

--
-- Primero se elimina la base de datos si existe
--

DROP DATABASE IF EXISTS `tiempolibre`;

-- --------------------------------------------------------

--
-- Se crea la base de datos
--

CREATE DATABASE IF NOT EXISTS `tiempolibre` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `tiempolibre`;

-- --------------------------------------------------------

--
-- Se asignan los permisos al usuario
--

GRANT ALL PRIVILEGES ON tiempolibre.* TO 'pcw'@127.0.0.1 IDENTIFIED BY 'pcw';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad`
--

DROP TABLE IF EXISTS `actividad`;
CREATE TABLE `actividad` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL COMMENT 'Nombre de la actividad',
  `descripcion` text NOT NULL COMMENT 'Descripción de la actividad',
  `lugar` varchar(100) NOT NULL,
  `fecha_alta` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha y hora de alta de la actividad',
  `login` varchar(20) NOT NULL COMMENT 'Login del usuario que crea la actividad',
  `valoracion` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'Valoración media de los usuarios. Se actualiza con cada comentario que se inserta.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `actividad`
--

INSERT INTO `actividad` (`id`, `nombre`, `descripcion`, `lugar`, `fecha_alta`, `login`, `valoracion`) VALUES
(1, 'Recorrido por Alicante ciudad', 'Recorrido por la ciudad de Alicante visitando los lugares más emblemáticos. Este actividad la podéis hacer durante la mañana, antes de ir a comer. Os recomiendo empezar por visitar el Castillo de Santa Bárbara, más o menos entre las 9:30h y 10:45h. Podéis subir al castillo por el ascensor cuyo acceso se encuentra en la Playa del Postiguet. A continuación, entre las 10:45h y 11:30h, podéis daros un paseo por el Casco Antiguo y tomaros algo en cualquiera de las cafeterías que hay en la plaza del Ayuntamiento o en las calles aledañas. Lo siguiente para visitar, entre las 11:30h y las 12:15, sería la famosa \"Calle de las Setas\", cuyo nombre es la calle San Francisco. Se trata de una calle peatonal decorada como un bosque de fantasía, con setas gigantes de colores, casitas de insectos y rayuelas pintadas en el suelo. Y ya por último, entre las 12:15h y las 13:30h, y antes de ir a comer, os recomiendo visitar la Explanada de España y el Puerto. Si seguís caminando por el puerto hacia el final de la Explanada, llegaréis al Parque de Canalejas, famoso por sus Ficus centenarios gigantes. Parecen árboles de cuento y dan mucha sombra. Tened en cuenta que Alicante es muy luminoso incluso en invierno. Gorras y crema solar son imprescindibles.', 'Alicante', '2026-01-08 09:15:44', 'usuario2', 4),
(2, 'Ruta de tapeo por Granada', 'Granada es probablemente la capital mundial de la tapa. El concepto es único: la tapa es gratis con cada bebida. No se elige (normalmente) la tapa, es un regalo de la casa que va ganando entidad conforme pides más rondas.<br>Una buena ruta sería empezar en el centro y terminar en el Realejo. Así pues, el inicio tradicional sería en la Calle Navas, más concretamente en el bar Los Diamantes. Su especialidad es la  fritura de pescado. Tiene un ambiente auténtico, es bullicioso y estrecho. Acuérdate de pedir una caña y prepárate para unos boquerones fritos o unas gambas que quitan el sentido. Es un \"must\" para empezar con energía.<br>La siguiente parada sería en la Plaza Bib-Rambla. Una plza en la que además de poder ver la Fuente de los Gigantones, no podrás pasar sin entrar en Bodegas Casa Casteñeda. Su especialidad es el \"Combinado Castañeda\" y su vermú de grifo. Es una de las tabernas más antiguas y las paredes están llenas de barricas gigantes. Sus tapas suelen ser generosas: montaditos, ensaladilla o sus famosas croquetas.<br>A continuación debes ir a la zona de los \"Estudiantes\". Allí tienes que entrar en la Bodega La Bella y La Bestia II, donde hacer honor al nombre y te sirven a lo \"bestia\", no te quedarás con hambre. Son famosos por servir tapas enormes (roscos rellenos, patatas, embutido). Es el sitio favorito de los universitarios antes de subir al Albaicín.<br>Por último y para terminar la ruta de tapeo, tienes que ir al Realejo, que es el barrio judio. El sitio a visitar es el restaurante Papaupa. Este sitio aporta un toque moderno y su especialidad es la fusión y las opciones vegetarianas/veganas. Tiene un ambiente más alternativo y tranquilo. Si quieres descansar del \"fritoleo\", este sitio ofrece tapas con un toque latino y presentaciones muy cuidadas.<br>Ten en cuenta que la hora punta es de 13:30 a 15:30 y de 20:30 a 22:30.', 'Granada', '2026-01-10 16:43:55', 'usuario4', 5),
(3, 'Ruta de la Brisa', 'Esta es una ruta perfecta para hacer a finales de febrero o principios de marzo con niños, ya que en esa época el clima de Alicante es ideal para pasear sin el agobio del calor veraniego.<br>Empezaremos a las 9:30h en el Mirador de la Cala Cantalar del Cabo de las Huertas. Es una reserva natural dentro de la ciudad. Recomiendo aparcar cerca de la calle de la Naya. Hay un sendero suave y llano (ideal para niños) que bordea la costa. En la Cala Cantalar, al ser roca volcánica y piedra blanca, el contraste con el azul del mar es increíble. No hace falta bajar al agua; desde el sendero las fotos son de postal.<br>A las 11h toca parada para almorzar en la Playa de San Juan. Se tarda 5 minutos en coche desde el Cabo de las Huertas. Poséis buscar cualquier terraza en la zona de \"La Sedienta\" o el \"Restaurante El Mayoral\". Pedid unas marineras (ensaladilla sobre rosquilla con anchoa, muy típico de aquí) o unos calamares a la romana mientras los niños juegan en la arena, que a esta hora está tranquila.<br>A las 12:15h, debéis estar en la Cala del Charco en Villajoyosa. Se tarda de 15 a 20 minutos en llegar por la N-332. En la cala podéis visitar una torre vigía antigua que hay sobre un acantilado. La torre y los acantilados de fondo hacen que el sitio sea muy fotogénico y a los niños les encantará la historia de \"la torre de los piratas\".<br>Por último, y para terminar la ruta, a las 13:30h podéis visitar las Casas de Colores de Villajoyosa. Están en el centro de Villajoyosa, a 5 minutos de la cala anterior. Pasearéis por la orilla del mar contemplando las famosas fachadas de colores. El reflejo de las casas rojas, azules y amarillas es obligatorio para cualquier álbum de fotos de Alicante.<br>Aunque no os bañéis, llevad calzado cómodo (deportivas), ya que el sendero del Cabo tiene alguna piedra suelta. Es conveniente llevar una chaqueta ligera porque en primavera puede refrescar al lado del mar.', 'Alicante', '2026-01-12 18:21:10', 'usuario3', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad_categoria`
--

DROP TABLE IF EXISTS `actividad_categoria`;
CREATE TABLE `actividad_categoria` (
  `id_categoria` int(11) NOT NULL,
  `id_actividad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `actividad_categoria`
--

INSERT INTO `actividad_categoria` (`id_categoria`, `id_actividad`) VALUES
(2, 1),
(3, 1),
(3, 3),
(4, 1),
(5, 1),
(5, 3),
(6, 2),
(9, 1),
(9, 2),
(10, 1),
(10, 3),
(11, 2),
(12, 2),
(13, 3),
(14, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`) VALUES
(11, 'Amigos'),
(3, 'Caminar'),
(4, 'Ciudad'),
(1, 'Cultural'),
(7, 'Deportiva'),
(2, 'Familiar'),
(10, 'FotoFriendly'),
(8, 'Lúdica'),
(14, 'Mar'),
(5, 'Niños'),
(13, 'Playa'),
(9, 'RutaUrbana'),
(6, 'Tapeo'),
(12, 'Tardeo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

DROP TABLE IF EXISTS `comentario`;
CREATE TABLE `comentario` (
  `id` int(11) NOT NULL,
  `texto` varchar(250) NOT NULL COMMENT 'Texto del comentario',
  `login` varchar(20) NOT NULL COMMENT 'Login del usuario que hace el comentario',
  `id_actividad` int(11) NOT NULL,
  `valoracion` tinyint(4) NOT NULL COMMENT 'Entero entre 1 y 5',
  `fecha_hora` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `comentario`
--

INSERT INTO `comentario` (`id`, `texto`, `login`, `id_actividad`, `valoracion`, `fecha_hora`) VALUES
(1, '¡Un acierto total! Empezar por el ascensor nos salvó la vida con el carrito. A mis peques les volvieron locos las setas gigantes de la calle San Francisco, no paraban de jugar. Recomiendo mucho terminar con el helado en la Explanada.', 'usuario1', 1, 5, '2026-01-09 11:57:10'),
(2, 'Muy buena ruta para hacer en una mañana. Es verdad que es muy cómoda y llana, aunque en el ascensor del castillo nos tocó esperar un poco de cola (unos 15 min). El paseo final por el puerto y ver los peces les encantó a los niños.', 'usuario3', 1, 4, '2026-01-09 17:09:10'),
(3, 'La combinación perfecta. Mis hijos (4 y 6 años) aguantaron todo el recorrido sin quejarse gracias a que bajábamos en vez de subir. Los Ficus del final son impresionantes, dan una sombra increíble para descansar un rato.', 'usuario4', 1, 5, '2026-01-10 08:12:10'),
(4, 'El recorrido es bonito y fácil, pero cuidado si vais en hora punta porque la zona de las Setas se pone imposible de gente y cuesta vigilar a los niños. Por lo demás, las vistas del castillo valen mucho la pena.', 'usuario5', 1, 3, '2026-01-12 17:02:10'),
(5, 'Los Diamantes es un 10 en pescaito, aunque siempre está lleno. Gran descubrimiento Papaupa en el Realejo: tapas fusión muy ricas. Bodegas Castañeda sigue siendo la catedral por su vermú y solera. ¡Imprescindible en Granada!', 'usuario1', 2, 5, '2026-01-12 11:01:51'),
(6, 'La Bella y La Bestia II es clave: con dos cañas cenas. Tapas gigantes y baratas, ideal antes de ir de fiesta. Calidad normal, pero cantidad insuperable. Id pronto porque en calle Elvira no cabe un alfiler a partir de las 21h.', 'usuario3', 2, 4, '2026-01-15 13:22:21'),
(7, 'Me encantó el contraste entre el bullicio de Navas y el bohemio Realejo. Las croquetas de la Castañeda son de otro planeta. Acabar la ruta en el Mirador de San Nicolás tras el tapeo fue el broche de oro. ¡Experiencia mágica!', 'usuario5', 2, 5, '2026-01-16 20:19:48'),
(8, 'Vistas bonitas, pero el sendero del Cabo estaba lleno de barro por las lluvias y con los niños fue un caos. La torre de Villajoyosa es chula, pero el parking estaba cerrado. Una mañana un poco estresante para ir con peques.', 'usuario1', 3, 2, '2026-01-13 10:49:50'),
(9, '\"La Cala Cantalar es bonita, pero en esta época el sol sale por un ángulo que genera muchas sombras en el acantilado. Para fotos está bien, pero no es espectacular. La parada en San Juan, demasiado cara para lo que comimos.', 'usuario4', 3, 3, '2026-01-13 12:07:50'),
(10, 'Ruta correcta para pasar el rato, pero nada del otro mundo si ya vives en Alicante. Villajoyosa siempre tiene encanto, pero la ruta de las calas se hace corta. Está bien para dar un paseo si no tienes nada mejor que hacer.', 'usuario5', 3, 3, '2026-01-15 08:10:37'),
(11, 'Lo mejor fue el pica-pica en la playa. El resto de la ruta estuvo bien, aunque el viento en los acantilados era molesto. Las casas de colores son lo más fotogénico del viaje. Un plan aceptable para una mañana de primavera.', 'usuario2', 3, 4, '2026-01-25 16:32:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `foto`
--

DROP TABLE IF EXISTS `foto`;
CREATE TABLE `foto` (
  `id` int(11) NOT NULL,
  `descripcion` varchar(250) NOT NULL COMMENT 'Descripción de la foto',
  `id_actividad` int(11) NOT NULL,
  `fichero` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `foto`
--

INSERT INTO `foto` (`id`, `descripcion`, `id_actividad`, `fichero`) VALUES
(1, 'Desde el Castillo de Santa Bárbara se domina toda la ciudad. Como ves, es una zona amplia y al aire libre, ideal para que los niños se muevan con seguridad mientras disfrutáis de esta panorámica del Mediterráneo.', 1, '1.jpg'),
(2, 'Esta es la plaza del Ayuntamiento que encontraréis al bajar del castillo. El suelo liso y el espacio abierto es perfecto para que los niños corran un poco sin peligro de coches mientras admirais la fachada barroca.', 1, '2.jpg'),
(3, 'La \"Calle de las Setas\". Fíjate en el tamaño de las figuras; es realmente como entrar en un cuento. Es peatonal y el suelo está pintado de colores, lo que la hace muy estimulante para los niños.', 1, '3.jpeg'),
(4, 'La Explanada de España. El famoso suelo ondulado compuesto por millones de teselas. Es el paseo marítimo por excelencia, flanqueado por palmeras que dan una sombra muy agradable para el paseo.', 1, '4.webp'),
(5, 'El puerto deportivo, justo al lado de la Explanada. Aquí podréis ver los mástiles de los veleros y barcos de recreo. El paseo es muy ancho y relajante, con el mar a un lado.', 1, '5.jpg'),
(6, 'Para terminar tenemos el Parque de Canalejas con ficus centenarios gigantes y gran espacio para caminar. Las raíces y troncos de los ficus son enormes, parecen esculturas naturales que llaman la atención.', 1, '6.jpg'),
(7, 'Es un bar de toda la vida del centro de Granada, pero se come de maravilla.', 2, '7.jpg'),
(8, 'Fuente de los Gigantones. Hoy en día es uno de los puntos de encuentro más concurridos de Granada', 2, '8.webp'),
(9, 'Bodegas Castañeda está en la calle Almireceros', 2, '9.webp'),
(10, 'Los típicos roscos rellenos de La Bella y la Bestia II', 2, '10.jpg'),
(11, 'El restaurante Papaupa ofrece una excelente comida fusión', 2, '11.jpg'),
(12, 'La Cala Cantalar es la más bonita del Cabo de la Huerta', 3, '12.jpg'),
(13, 'En la playa de San Juan hay muchos chiringuitos en los que poder tomar algo', 3, '13.jpg'),
(14, 'La Cala del Charco con la torre vigía al fondo', 3, '14.jpg'),
(15, 'Imagen preciosa de las famosas casas de colores de Villajoyosa, justo frente a su playa. Es uno de los paisajes más icónicos y alegres de la costa alicantina.', 3, '15.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `login` varchar(20) NOT NULL,
  `pwd` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `token` varchar(250) DEFAULT NULL,
  `ultimo_acceso` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto` varchar(100) NOT NULL DEFAULT 'nofotousu.webp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`login`, `pwd`, `email`, `token`, `ultimo_acceso`, `foto`) VALUES
('usuario1', 'usuario1', 'usuario1@pcw.es', NULL, '2023-02-24 10:06:51', 'usuario1.jpeg'),
('usuario2', 'usuario2', 'usuario2@pcw.es', NULL, '2026-02-14 08:12:10', 'usuario2.jpeg'),
('usuario3', 'usuario3', 'usuario3@pcw.es', NULL, '2026-02-12 16:43:22', 'usuario3.jpg'),
('usuario4', 'usuario4', 'usuario4@pcw.es', NULL, '2026-02-15 09:50:24', 'usuario4.png'),
('usuario5', 'usuario5', 'usuario5@pcw.es', NULL, '2026-02-13 17:47:53', 'usuario5.png');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `login` (`login`);

--
-- Indices de la tabla `actividad_categoria`
--
ALTER TABLE `actividad_categoria`
  ADD PRIMARY KEY (`id_categoria`,`id_actividad`),
  ADD KEY `actividad_categoria_ibfk_1` (`id_actividad`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_actividad` (`id_actividad`),
  ADD KEY `login` (`login`);

--
-- Indices de la tabla `foto`
--
ALTER TABLE `foto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_actividad` (`id_actividad`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`login`) USING BTREE,
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividad`
--
ALTER TABLE `actividad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `comentario`
--
ALTER TABLE `comentario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `foto`
--
ALTER TABLE `foto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD CONSTRAINT `actividad_ibfk_1` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `actividad_categoria`
--
ALTER TABLE `actividad_categoria`
  ADD CONSTRAINT `actividad_categoria_ibfk_1` FOREIGN KEY (`id_actividad`) REFERENCES `actividad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `actividad_categoria_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_actividad`) REFERENCES `actividad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `comentario_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `foto`
--
ALTER TABLE `foto`
  ADD CONSTRAINT `foto_ibfk_1` FOREIGN KEY (`id_actividad`) REFERENCES `actividad` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
