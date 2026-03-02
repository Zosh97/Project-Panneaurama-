// =============================================
// Chargement de la page
// =============================================
document.addEventListener("DOMContentLoaded", () => {

  initPhonemeCells();

  const select = document.getElementById("langue-select");
  if (!select) {
    console.error("Select #langue-select introuvable");
    return;
  }

  // =============================================
  // 1) Charger dynamiquement toutes les langues
  // =============================================
  fetch("get_langues.php")
    .then(response => response.json())
    .then(langues => {

      langues.forEach(langue => {
        const option = document.createElement("option");
        option.value = langue.id;        // ID utilisé pour la requête
        option.textContent = langue.nom; // Nom affiché
        select.appendChild(option);
      });

    })
    .catch(error => {
      console.error("Erreur chargement langues :", error);
    });

  // =============================================
  // 2) Quand une langue est sélectionnée
  // =============================================
  select.addEventListener("change", function() {

    const langueId = this.value;

    if (!langueId) {
      resetPhonemes();
      return;
    }

    fetch(`get_phonemes.php?langue_id=${encodeURIComponent(langueId)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success) throw new Error(data.error || "Erreur inconnue");

        mettreEnEvidencePhonemes(
          data.phonemes_francais,
          data.phonemes_autre_langue
        );
      })
      .catch(error => {
        console.error("Erreur récupération phonèmes :", error);
      });

  });

});


// =============================================
// Initialisation des phonèmes du tableau
// =============================================
function initPhonemeCells() {

  const containers = ["#consonnes", "#vowels"];

  containers.forEach(sel => {
    document.querySelectorAll(`${sel} span`).forEach(span => {

      const ph = normalizePhoneme(span.textContent);
      if (!ph) return;

      span.classList.add("phoneme-cell", "absent");
      span.dataset.phoneme = ph;

    });
  });
}


// =============================================
// Réinitialisation (tout en gris)
// =============================================
function resetPhonemes() {

  document.querySelectorAll(".phoneme-cell").forEach(cell => {
    cell.classList.remove("present-fr", "present-autre", "present-commun");
    cell.classList.add("absent");
  });

}


// =============================================
// Mise en évidence des phonèmes
// =============================================
function mettreEnEvidencePhonemes(phonemesFr, phonemesAutre) {

  resetPhonemes();

  const setFr = new Set((phonemesFr || []).map(normalizePhoneme));
  const setAutre = new Set((phonemesAutre || []).map(normalizePhoneme));

  // Français (vert)
  setFr.forEach(ph => {
    document.querySelectorAll(`.phoneme-cell[data-phoneme="${CSS.escape(ph)}"]`)
      .forEach(cell => {
        cell.classList.remove("absent");
        cell.classList.add("present-fr");
      });
  });

  // Autre langue (bleu)
  setAutre.forEach(ph => {
    document.querySelectorAll(`.phoneme-cell[data-phoneme="${CSS.escape(ph)}"]`)
      .forEach(cell => {
        cell.classList.remove("absent");
        cell.classList.add("present-autre");
      });
  });

  // Communs (violet)
  setFr.forEach(ph => {
    if (!setAutre.has(ph)) return;

    document.querySelectorAll(`.phoneme-cell[data-phoneme="${CSS.escape(ph)}"]`)
      .forEach(cell => {
        cell.classList.add("present-commun");
      });
  });

}


// =============================================
// Normalisation des phonèmes
// =============================================
function normalizePhoneme(x) {
  return String(x || "")
    .trim()
    .replaceAll("/", "")
    .replace(/\s+/g, "");
}