<?php
require 'config.php';
header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';
$in = json_decode(file_get_contents('php://input'), true) ?? [];
function out($d, $c = 200) { http_response_code($c); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function admin($in) { if (!hash_equals(ADMIN_PASSWORD, (string)($in['mdp'] ?? ''))) out(['erreur' => 'Mot de passe incorrect'], 403); }

switch ($action) {
  case 'annonces': // dernière annonce de chaque plat
    out($pdo->query("SELECT a.plat_id, a.prepare, a.lieu, DATE_FORMAT(a.cree_le,'%d/%m %H:%i') date
      FROM annonces a JOIN (SELECT plat_id, MAX(id) mid FROM annonces GROUP BY plat_id) x ON a.id = x.mid")->fetchAll());

  case 'reserver':
    $nom = trim($in['nom'] ?? ''); $tel = trim($in['telephone'] ?? '');
    $date = $in['date'] ?? ''; $heure = $in['heure'] ?? ''; $pers = (int)($in['personnes'] ?? 0);
    $plat = (int)($in['plat'] ?? 0) ?: null;
    if ($nom === '' || $tel === '' || !$date || !$heure || $pers < 1 || $pers > 20 || $date < date('Y-m-d'))
      out(['erreur' => 'Vérifiez les champs du formulaire.'], 400);
    $pdo->prepare('INSERT INTO reservations (nom, telephone, plat_id, date_resa, heure, personnes) VALUES (?,?,?,?,?,?)')
        ->execute([$nom, $tel, $plat, $date, $heure, $pers]);
    out(['ok' => true]);

  case 'annoncer':
    admin($in);
    $prepare = !empty($in['prepare']) ? 1 : 0;
    $pdo->prepare('INSERT INTO annonces (plat_id, prepare, lieu) VALUES (?,?,?)')
        ->execute([(int)($in['plat'] ?? 0), $prepare, $prepare ? trim($in['lieu'] ?? '') : null]);
    out(['ok' => true]);

  case 'reservations':
    admin($in);
    out($pdo->query('SELECT r.*, p.nom plat FROM reservations r LEFT JOIN plats p ON p.id = r.plat_id ORDER BY date_resa, heure')->fetchAll());

  case 'votes': // votes du jour
    out($pdo->query("SELECT plat_id, COUNT(*) n FROM votes WHERE DATE(cree_le) = CURDATE() GROUP BY plat_id")->fetchAll());

  case 'voter': // un vote par personne et par jour
    if (($_COOKIE['a_vote'] ?? '') === date('Y-m-d')) out(['erreur' => 'Vous avez déjà voté aujourd’hui.'], 429);
    $id = (int)($in['plat'] ?? 0);
    $ok = $pdo->prepare('SELECT id FROM plats WHERE id = ?'); $ok->execute([$id]);
    if (!$ok->fetch()) out(['erreur' => 'Plat inconnu'], 400);
    $pdo->prepare('INSERT INTO votes (plat_id) VALUES (?)')->execute([$id]);
    setcookie('a_vote', date('Y-m-d'), time() + 86400, '/');
    out(['ok' => true]);

  default: out(['erreur' => 'Action inconnue'], 404);
}