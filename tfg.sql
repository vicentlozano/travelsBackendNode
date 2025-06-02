-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.7.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para travel_app
CREATE DATABASE IF NOT EXISTS `travel_app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `travel_app`;

-- Volcando estructura para tabla travel_app.contacts
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `pending` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `FK_contacts_users` (`user_id`),
  KEY `FK_contacts_users_2` (`friend_id`),
  CONSTRAINT `FK_contacts_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_contacts_users_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla travel_app.contacts: ~7 rows (aproximadamente)
INSERT INTO `contacts` (`id`, `user_id`, `friend_id`, `pending`) VALUES
	(1, 1, 19, 0),
	(2, 19, 1, 1),
	(5, 23, 1, 1),
	(6, 1, 23, 1),
	(8, 1, 26, 1),
	(12, 26, 1, 1),
	(16, 29, 1, 1);

-- Volcando estructura para tabla travel_app.messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(1000) NOT NULL,
  `sendFrom` int(11) NOT NULL,
  `sendTo` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `viewed` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK__users` (`sendTo`) USING BTREE,
  KEY `FK__users_2` (`sendFrom`) USING BTREE,
  CONSTRAINT `FK_messages_users` FOREIGN KEY (`sendTo`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_messages_users_2` FOREIGN KEY (`sendFrom`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=467 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla travel_app.messages: ~87 rows (aproximadamente)
INSERT INTO `messages` (`id`, `message`, `sendFrom`, `sendTo`, `date`, `viewed`) VALUES
	(380, 'sdfasdf', 1, 21, '2025-05-11 01:28:17', 1),
	(381, 'asdfsdfsdf', 1, 19, '2025-05-11 01:28:29', 1),
	(382, 'sdfasdf', 1, 19, '2025-05-11 01:28:34', 1),
	(383, 'asdf', 1, 19, '2025-05-11 01:28:35', 1),
	(384, 'ffff', 1, 19, '2025-05-11 01:28:37', 1),
	(385, 'fff', 1, 19, '2025-05-11 01:28:39', 1),
	(386, 'sssss', 1, 19, '2025-05-11 01:28:41', 1),
	(387, 'ssss', 1, 19, '2025-05-11 01:28:44', 1),
	(388, 'sdfsdf', 1, 19, '2025-05-11 01:28:47', 1),
	(389, 'sdfsdf', 1, 19, '2025-05-11 01:28:49', 1),
	(390, 'sdfsdfdf', 1, 19, '2025-05-11 01:28:53', 1),
	(391, 'sdfsdf', 1, 19, '2025-05-11 01:28:56', 1),
	(392, 'sdfsdf', 1, 19, '2025-05-11 01:28:59', 1),
	(393, 'fsdfsfd', 1, 19, '2025-05-11 01:29:02', 1),
	(394, 'fsdfsdf', 1, 19, '2025-05-11 01:29:06', 1),
	(395, 'hola amor', 1, 19, '2025-05-11 01:29:13', 1),
	(396, 'estas', 19, 1, '2025-05-11 01:29:25', 1),
	(397, 'dd', 19, 1, '2025-05-11 01:29:31', 1),
	(398, 'ddd', 19, 1, '2025-05-11 01:29:33', 1),
	(399, 'ddd', 19, 1, '2025-05-11 01:29:36', 1),
	(400, 'ddd', 19, 1, '2025-05-11 01:29:38', 1),
	(401, 'dddd', 19, 1, '2025-05-11 01:29:41', 1),
	(402, 'dddd', 19, 1, '2025-05-11 01:29:44', 1),
	(403, 'ddd', 19, 1, '2025-05-11 01:29:47', 1),
	(404, 'ddddd', 19, 1, '2025-05-11 01:29:50', 1),
	(405, 'dddd', 19, 1, '2025-05-11 01:29:54', 1),
	(406, 'dddd', 19, 1, '2025-05-11 01:29:57', 1),
	(407, 'dddd', 1, 19, '2025-05-11 01:30:06', 1),
	(408, 'ddd', 1, 19, '2025-05-11 01:30:08', 1),
	(409, 'dddd', 1, 19, '2025-05-11 01:30:11', 1),
	(410, 'dddd', 1, 19, '2025-05-11 01:30:14', 1),
	(411, 'hola', 1, 19, '2025-05-11 01:30:40', 1),
	(412, 'hiola', 1, 19, '2025-05-11 01:35:39', 1),
	(413, 'edasd', 1, 19, '2025-05-11 01:35:41', 1),
	(414, 'asda', 1, 19, '2025-05-11 01:35:42', 1),
	(415, 'asd', 1, 19, '2025-05-11 01:35:42', 1),
	(416, 'dasd', 1, 19, '2025-05-11 01:35:44', 1),
	(417, 'asdasd', 1, 19, '2025-05-11 01:35:47', 1),
	(418, 'dasdasdgjgh', 1, 19, '2025-05-11 01:36:38', 1),
	(419, 'dfg', 1, 19, '2025-05-11 01:36:39', 1),
	(420, 'sdfgsd', 1, 19, '2025-05-11 01:36:40', 1),
	(421, 'estas seguro ?', 1, 19, '2025-05-11 01:36:45', 1),
	(422, 'nop', 1, 19, '2025-05-11 01:36:49', 1),
	(423, 'dfg', 1, 19, '2025-05-11 01:36:52', 1),
	(424, 'dsfgdf', 1, 19, '2025-05-11 01:36:55', 1),
	(425, 'dfgsdfg', 1, 19, '2025-05-11 01:36:59', 1),
	(426, 'dfdsfg', 1, 19, '2025-05-11 01:37:01', 1),
	(427, 'gsdfg', 19, 1, '2025-05-11 01:37:05', 1),
	(428, 'dsfg', 19, 1, '2025-05-11 01:37:06', 1),
	(429, 'sdfgg', 19, 1, '2025-05-11 01:37:09', 1),
	(430, 'dfgdfg', 19, 1, '2025-05-11 01:37:22', 1),
	(431, 'sdfsdf', 1, 19, '2025-05-11 01:39:02', 1),
	(432, 'sdfsdf', 1, 19, '2025-05-11 01:39:05', 1),
	(433, 'sdfsdf', 1, 19, '2025-05-11 01:39:07', 1),
	(434, 'aaaaaaa', 1, 19, '2025-05-11 01:39:11', 1),
	(435, 'aaaaaa', 1, 19, '2025-05-11 01:39:14', 1),
	(436, 'wwww', 1, 19, '2025-05-11 01:39:17', 1),
	(437, 'agdfgdfg', 1, 19, '2025-05-11 01:39:58', 1),
	(438, 'dfg', 1, 19, '2025-05-11 01:40:16', 1),
	(439, 'gdfgdfg', 1, 19, '2025-05-11 01:40:25', 1),
	(440, 'dfgdfgdfg', 1, 19, '2025-05-11 01:40:28', 1),
	(441, 'dfgfg', 1, 19, '2025-05-11 01:40:30', 1),
	(442, 'gdfgdfg', 1, 19, '2025-05-11 01:40:32', 1),
	(443, 'gdfgdfg', 1, 19, '2025-05-11 01:40:35', 1),
	(444, 'aaaa', 1, 19, '2025-05-11 01:40:38', 1),
	(445, 'aaaa', 1, 19, '2025-05-11 01:40:41', 1),
	(446, 'eeee', 1, 19, '2025-05-11 01:40:44', 1),
	(447, 'eee', 1, 19, '2025-05-11 01:40:46', 1),
	(448, 'estas contenta?', 1, 19, '2025-05-11 01:40:54', 1),
	(449, 'hola', 19, 1, '2025-05-13 19:52:33', 1),
	(450, 'hola', 19, 1, '2025-05-13 19:52:37', 1),
	(451, 'holasadfasdf', 19, 1, '2025-05-13 19:52:46', 1),
	(452, 'asdfasdf', 19, 1, '2025-05-13 19:52:57', 1),
	(453, 'fgsdfg', 1, 19, '2025-05-13 19:53:53', 1),
	(454, 'fgsdfgghjfghj', 1, 19, '2025-05-13 19:54:18', 1),
	(455, 'fgsdfgghjfghjfdgsdf', 1, 19, '2025-05-13 19:55:58', 1),
	(456, 'fghdhdfg', 1, 19, '2025-05-13 19:56:26', 1),
	(457, 'dfghdfgh', 19, 1, '2025-05-13 19:56:37', 1),
	(458, 'fghjfghjhgj', 19, 1, '2025-05-13 19:56:45', 1),
	(459, 'dfsdfgsdfg', 1, 19, '2025-05-21 12:09:08', 1),
	(460, 'hola!', 19, 1, '2025-05-21 12:13:35', 1),
	(461, 'como estas?', 19, 1, '2025-05-21 12:13:47', 1),
	(462, 'pues nada bien', 1, 19, '2025-05-21 12:13:53', 1),
	(463, 'tu estas guay ?', 1, 19, '2025-05-21 12:14:02', 1),
	(464, 'fgsdfgsdfg', 19, 1, '2025-05-21 12:15:41', 1),
	(465, 'ddkjdhkjhd', 19, 1, '2025-05-21 12:18:16', 1),
	(466, 'dlkdjjkdd', 19, 1, '2025-05-21 12:18:19', 1);

-- Volcando estructura para tabla travel_app.travels
CREATE TABLE IF NOT EXISTS `travels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` bigint(20) NOT NULL DEFAULT 0,
  `travel_date` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `travels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla travel_app.travels: ~1 rows (aproximadamente)
INSERT INTO `travels` (`id`, `name`, `price`, `travel_date`, `user_id`, `user_name`, `created_at`) VALUES
	(29, 'España', 300, '2025/05/01-2025/05/07', 1, 'admin', '2025-05-28 12:45:07');

-- Volcando estructura para tabla travel_app.travel_places
CREATE TABLE IF NOT EXISTS `travel_places` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `travel_id` int(11) NOT NULL,
  `place` varchar(255) NOT NULL,
  `image` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `travel_id` (`travel_id`),
  CONSTRAINT `travel_places_ibfk_1` FOREIGN KEY (`travel_id`) REFERENCES `travels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla travel_app.travel_places: ~2 rows (aproximadamente)
INSERT INTO `travel_places` (`id`, `travel_id`, `place`, `image`) VALUES
	(54, 29, 'Calp', 'https://travelsvlh.s3.eu-north-1.amazonaws.com/calpe-top-10-lugares-que-ver-peÃ±on-de-ifach-hero-2___responsive_865_320.jpg'),
	(55, 29, 'Moraira', 'https://travelsvlh.s3.eu-north-1.amazonaws.com/Moraira-El-Portet.webp');

-- Volcando estructura para tabla travel_app.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '0',
  `lastname` varchar(50) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `gender` varchar(50) NOT NULL,
  `avatar` longtext DEFAULT NULL,
  `register_token` varchar(300) DEFAULT NULL,
  `verified` tinyint(1) unsigned zerofill NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla travel_app.users: ~9 rows (aproximadamente)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `lastname`, `role`, `created_at`, `gender`, `avatar`, `register_token`, `verified`) VALUES
	(1, 'admin@gmail.com', '21232f297a57a5a743894a0e4a801fc3', 'admin', 'admin', 'admin', '2025-04-03 13:58:49', 'Male', 'https://travelsvlh.s3.eu-north-1.amazonaws.com/myself2.jpg\r\n', NULL, 1),
	(19, 'lozanodroid@gmail.com', '86069e4176c1bf6ac7f3eda95c31c460', 'vicent', 'lozano', 'user', '2025-04-29 15:27:52', 'Male', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpg', '', 1),
	(21, 'pepito@gmail.com', '3db3ce36ba550c64420c56f030296579', 'maria', 'dfghdfgh', 'user', '2025-05-05 13:06:23', 'Female', 'https://travelsvlh.s3.eu-north-1.amazonaws.com/myself2.jpg', '', 1),
	(23, 'pepepepe@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'pepita', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1),
	(25, 'mario@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'mario', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1),
	(26, 'maeeio@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'ee', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1),
	(27, 'maeedio@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'ddd', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1),
	(28, 'maeedido@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'ddddd', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1),
	(29, 'maeediaado@gmail.com', 'bc00db831bd94db7e7091bb6ea96d97b', 'aaa', 'sdfgsdf', 'user', '2025-05-06 09:05:30', 'Female', 'https://st5.depositphotos.com/62628780/71388/i/450/depositphotos_713887546-stock-photo-black-girl-student-smile-university.jpgined', '', 1);

-- Volcando estructura para disparador travel_app.check_year_before_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER `check_year_before_insert` BEFORE INSERT ON `travels` FOR EACH ROW BEGIN
    IF NEW.travel_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha no puede ser mayor que la fecha actual';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
