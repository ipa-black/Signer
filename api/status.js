export default async function handler(req, res) {
    const { build_id, app } = req.query;
    const GITHUB_TOKEN = process.env.GITHUB_PAT;
    const GITHUB_REPO = process.env.GITHUB_REPO;

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/tags/build-${build_id}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });

        if (response.status === 200) {
            const ipaUrl = `https://github.com/${GITHUB_REPO}/releases/download/build-${build_id}/${app}_signed.ipa`;
            const bundleUrl = `https://github.com/${GITHUB_REPO}/releases/download/build-${build_id}/bundle_id.txt`;
            return res.status(200).json({ status: 'done', ipaUrl, bundleUrl });
        } else if (response.status === 404) {
            return res.status(200).json({ status: 'processing' });
        } else {
            return res.status(500).json({ error: 'GitHub API error' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
}
