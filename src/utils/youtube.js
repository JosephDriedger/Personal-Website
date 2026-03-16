function extractYouTubeId(input)
{
    if (!input)
    {
        return "";
    }

    const value = String(input).trim();

    if (!value)
    {
        return "";
    }

    const idPattern = /^[a-zA-Z0-9_-]{11}$/;

    if (idPattern.test(value))
    {
        return value;
    }

    const patterns = [
        /[?&]v=([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns)
    {
        const match = value.match(pattern);

        if (match)
        {
            return match[1];
        }
    }

    return "";
}

function buildEmbedUrl(input)
{
    const youtubeId = extractYouTubeId(input);

    if (!youtubeId)
    {
        return "";
    }

    return `https://www.youtube.com/embed/${youtubeId}`;
}

module.exports = {
    extractYouTubeId,
    buildEmbedUrl
};