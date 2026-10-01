// ===== À MODIFIER =====
const LIEU = {
  adresse: "Au niveau du Colim, derrière le Centre d’Excellence, Sangmélima",
  horaires: "Tous les jours, de 11h à 20h"
};
// Pour vos vraies photos : écrivez le chemin dans "photo" (ex: "images/saka-saka.jpg")
const PLATS = [
  {id:1, nom:"Haricot à la viande de bœuf", desc:"Haricots mijotés longuement avec des morceaux de bœuf tendre.", photo:"", fond:"#06311F", sauce:"#8a4220", morceau:"#4a1f10"},
  {id:2, nom:"Poisson aux légumes", desc:"Poisson frais cuit avec des légumes du jour.", photo:"", fond:"#0A4D32", sauce:"#e08a2e", morceau:"#2f8f4a"},
  {id:3, nom:"Poisson à l’oseille", desc:"Poisson relevé par l’acidité des feuilles d’oseille.", photo:"", fond:"#06311F", sauce:"#7fa02f", morceau:"#f0e8c0"},
  {id:4, nom:"Viande de brousse à la mouambe", desc:"Viande de brousse cuite dans la sauce de noix de palme.", photo:"", fond:"#D7263D", sauce:"#e0961f", morceau:"#4a2a10"},
  {id:5, nom:"Viande de brousse au bouillon", desc:"Viande de brousse dans un bouillon épicé et parfumé.", photo:"", fond:"#0A4D32", sauce:"#c4701f", morceau:"#5b3513"},
  {id:6, nom:"Saka-saka", desc:"Feuilles de manioc pilées, cuites à l’huile de palme.", photo:"", fond:"#FFC72C", sauce:"#2f6a2c", morceau:"#1d4a1d"}
];
// ======================

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mdp = "";

async function api(action, body){
  let r, d;
  try {
    r = await fetch("api.php?action="+action, body ? {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {});
    d = await r.json();
  } catch(e){
    throw new Error("Le serveur ne répond pas. Ouvrez le site par http://localhost/... (pas en double-cliquant sur le fichier) et vérifiez config.php.");
  }
  if (!r.ok) throw new Error(d.erreur || "Erreur");
  return d;
}
function image(p){
  if (p.photo) return p.photo;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${p.fond}"/><ellipse cx="200" cy="175" rx="150" ry="62" fill="#f3efe4"/><ellipse cx="200" cy="165" rx="125" ry="46" fill="${p.sauce}"/><circle cx="160" cy="160" r="14" fill="${p.morceau}"/><circle cx="215" cy="150" r="16" fill="${p.morceau}"/><circle cx="250" cy="172" r="12" fill="${p.morceau}"/><circle cx="185" cy="182" r="11" fill="${p.morceau}"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

async function afficher(){
  const ann = {}, votes = {};
  try {
    (await api("annonces")).forEach(a => ann[a.plat_id] = a);
    (await api("votes")).forEach(v => votes[v.plat_id] = +v.n);
    $("#erreurGlobale").hidden = true;
  } catch(e){ $("#erreurGlobale").textContent = e.message; $("#erreurGlobale").hidden = false; }

  $("#grille").innerHTML = PLATS.map(p => {
    const a = ann[p.id];
    const badge = a ? `<span class="badge ${+a.prepare?'oui':'non'}">${+a.prepare?'Préparé aujourd’hui':'Pas préparé aujourd’hui'}</span>` : `<span class="badge">Pas encore annoncé</span>`;
    const lieu = (a && +a.prepare && a.lieu) ? a.lieu : LIEU.adresse;
    return `<article class="plat"><img src="${esc(image(p))}" alt="${esc(p.nom)}"><div><h3>${esc(p.nom)}</h3><p>${esc(p.desc)}</p>${badge}<p class="lieu">Lieu : ${esc(lieu)}</p></div></article>`;
  }).join("");

  $("#listeAnnonces").innerHTML = PLATS.map(p => {
    const a = ann[p.id];
    const txt = !a ? "Pas encore d’annonce." : +a.prepare ? `Je prépare ce plat. Lieu : ${esc(a.lieu || LIEU.adresse)}.` : "Je ne prépare pas ce plat aujourd’hui.";
    return `<li class="${a?(+a.prepare?'oui':'non'):''}"><strong>${esc(p.nom)}</strong><span>${txt}</span>${a?`<small>Annoncé le ${esc(a.date)}</small>`:''}</li>`;
  }).join("");

  const total = Object.values(votes).reduce((x,y)=>x+y,0);
  $("#choix").innerHTML = PLATS.map(p => {
    const n = votes[p.id] || 0, pc = total ? Math.round(n*100/total) : 0;
    return `<label class="choix"><input type="radio" name="plat" value="${p.id}" required><span class="nom">${esc(p.nom)}</span><span class="barre"><i style="width:${pc}%"></i></span><span class="nb">${n} vote${n>1?'s':''}</span></label>`;
  }).join("");
}

// Lieu
$("#lieuAdresse").textContent = LIEU.adresse;
$("#lieuHoraires").textContent = LIEU.horaires;
$("#lieuCarte").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(LIEU.adresse);

// Vote
$("#formVote").addEventListener("submit", async e => {
  e.preventDefault();
  const plat = new FormData(e.target).get("plat");
  try {
    await api("voter", {plat:+plat});
    $("#msgVote").textContent = "Merci, votre vote est enregistré."; $("#msgVote").hidden = false; afficher();
  } catch(err){ alert(err.message); }
});

// Réservation
$("#selPlat").innerHTML += PLATS.map(p => `<option value="${p.id}">${esc(p.nom)}</option>`).join("");
$("#formResa input[name=date]").min = new Date().toISOString().slice(0,10);
$("#formResa").addEventListener("submit", async e => {
  e.preventDefault();
  try { await api("reserver", Object.fromEntries(new FormData(e.target))); e.target.reset(); $("#msgResa").hidden = false; }
  catch(err){ alert(err.message); }
});

// Espace cuisinier
async function listerResas(){
  try {
    const r = await api("reservations", {mdp});
    $("#listeResas").innerHTML = r.length ? `<table><tr><th>Date</th><th>Heure</th><th>Nom</th><th>Téléphone</th><th>Pers.</th><th>Plat</th></tr>${r.map(x=>`<tr><td>${esc(x.date_resa)}</td><td>${esc(x.heure.slice(0,5))}</td><td>${esc(x.nom)}</td><td>${esc(x.telephone)}</td><td>${esc(x.personnes)}</td><td>${esc(x.plat||'-')}</td></tr>`).join("")}</table>` : "<p>Aucune réservation pour le moment.</p>";
    return true;
  } catch(e){ alert(e.message); return false; }
}
function formsCuisinier(){
  $("#formsAnnonce").innerHTML = PLATS.map(p => `<div class="ligne"><strong>${esc(p.nom)}</strong>
    <select id="pr${p.id}"><option value="1">Je prépare</option><option value="0">Je ne prépare pas</option></select>
    <input id="li${p.id}" placeholder="Lieu (vide = adresse par défaut)" maxlength="150">
    <button type="button" onclick="publier(${p.id})">Publier</button></div>`).join("");
}
async function publier(id){
  try { await api("annoncer", {mdp, plat:id, prepare:$("#pr"+id).value==="1", lieu:$("#li"+id).value}); afficher(); }
  catch(e){ alert(e.message); }
}
$("#btnCuisinier").addEventListener("click", async () => {
  mdp = prompt("Mot de passe du cuisinier :") || "";
  if (await listerResas()){ $("#cuisinier").style.display="block"; formsCuisinier(); $("#cuisinier").scrollIntoView(); }
});
afficher();