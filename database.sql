CREATE DATABASE IF NOT EXISTS restaurant_congolais CHARACTER SET utf8mb4;
USE restaurant_congolais;

CREATE TABLE plats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  image VARCHAR(100) NOT NULL
);

CREATE TABLE annonces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plat_id INT NOT NULL,
  prepare TINYINT(1) NOT NULL,
  lieu VARCHAR(150) DEFAULT NULL,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE CASCADE
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  plat_id INT DEFAULT NULL,
  date_resa DATE NOT NULL,
  heure TIME NOT NULL,
  personnes TINYINT NOT NULL,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE SET NULL
);

CREATE TABLE votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plat_id INT NOT NULL,
  cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plat_id) REFERENCES plats(id) ON DELETE CASCADE
);

INSERT INTO plats (nom, description, image) VALUES
('Haricot à la viande de bœuf', 'Haricots mijotés longuement avec des morceaux de bœuf tendre.', 'haricot-boeuf.svg'),
('Poisson aux légumes', 'Poisson frais cuit avec des légumes du jour.', 'poisson-legumes.svg'),
('Poisson à l’oseille', 'Poisson relevé par l’acidité des feuilles d’oseille.', 'poisson-oseille.svg'),
('Viande de brousse à la mouambe', 'Viande de brousse cuite dans la sauce de noix de palme.', 'brousse-mouambe.svg'),
('Viande de brousse au bouillon', 'Viande de brousse dans un bouillon épicé et parfumé.', 'brousse-bouillon.svg'),
('Saka-saka', 'Feuilles de manioc pilées, cuites à l’huile de palme.', 'saka-saka.svg');