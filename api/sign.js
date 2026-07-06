export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { app, password, p12, prov } = req.body;
    const GITHUB_TOKEN = process.env.GITHUB_PAT;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const buildId = Date.now().toString();

    try {
        const githubRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event_type: 'trigger-sign',
                client_payload: {
                    app_name: app,
                    password: password,
                    p12_base64: p12,
                    prov_base64: prov,
                    build_id: buildId
                }
            })
        });

        if (!githubRes.ok) throw new Error('Engine rejected the request');
        res.status(200).json({ build_id: buildId });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
