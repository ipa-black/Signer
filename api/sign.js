export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // 1. استخراج المتغير الجديد (use_free_cert) من الطلب
    const { app, password, p12, prov, use_free_cert } = req.body;
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
                    // 2. إذا كانت الشهادة مجانية، نرسل قيماً فارغة لتجنب أخطاء undefined
                    password: password || "",
                    p12_base64: p12 || "",
                    prov_base64: prov || "",
                    // 3. تحويل المتغير إلى نص (String) ليتطابق مع شروط Bash في GitHub Actions
                    use_free_cert: use_free_cert ? "true" : "false",
                    build_id: buildId
                }
            })
        });

        if (!githubRes.ok) {
            // طباعة الخطأ في سجلات Vercel لتسهيل تتبع أي مشكلة مستقبلاً
            const errorText = await githubRes.text();
            console.error("GitHub API Error:", errorText);
            throw new Error('Engine rejected the request');
        }
        
        res.status(200).json({ build_id: buildId });
    } catch (error) {
        console.error("Signing API Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
