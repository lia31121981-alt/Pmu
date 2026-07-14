// Fonction serveur Vercel : va chercher les données sur l'API PMU à la place
// du navigateur (aucun souci de CORS, aucune dépendance à un proxy tiers).
// Déployée automatiquement par Vercel depuis /api/pmu-proxy.js.
//
// Utilisation côté client : /api/pmu-proxy?path=/rest/client/7/programme/13072026

module.exports = async function handler(req, res) {
  const { path } = req.query;
  if (!path || !path.startsWith('/rest/client/')) {
    res.status(400).json({ error: 'Paramètre "path" manquant ou invalide.' });
    return;
  }

  const targetUrl = 'https://offline.turfinfo.api.pmu.fr' + path;

  try {
    const pmuRes = await fetch(targetUrl, {
      headers: { 'Accept': 'application/json' }
    });
    if (!pmuRes.ok) {
      res.status(pmuRes.status).json({ error: 'PMU a répondu ' + pmuRes.status });
      return;
    }
    const data = await pmuRes.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Échec de la requête vers PMU : ' + e.message });
  }
};
