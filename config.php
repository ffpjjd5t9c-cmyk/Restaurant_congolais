<?php
// ===== CONNEXION À LA BASE DE DONNÉES : modifiez ces lignes =====
const DB_HOST = 'localhost';
const DB_NAME = 'restaurant_congolais';
const DB_USER = 'root';
const DB_PASS = '';
// Mot de passe de l'espace cuisinier
const ADMIN_PASSWORD = 'changez-moi';

try {
    $pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode(['erreur' => 'Connexion à la base de données impossible. Vérifiez config.php']));
}