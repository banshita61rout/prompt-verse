import "dotenv/config";

const getGeminiResponse = async (message) => {
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: [{ text: message }]
                }
            ]
        })
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            console.log("Gemini API error:", data);
            return "Sorry, I could not generate a reply right now.";
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return reply || "Sorry, I could not generate a reply right now.";

    } catch (err) {
        console.log(err);
        return "Sorry, something went wrong while talking to the AI.";
    }
};

export default getGeminiResponse;
