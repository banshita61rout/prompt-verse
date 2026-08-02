import "dotenv/config";

const getGroqResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
        const data = await response.json();

        if (!response.ok) {
            console.log("Groq API error:", data);
            return "Sorry, I could not generate a reply right now.";
        }

        const reply = data?.choices?.[0]?.message?.content;
        return reply || "Sorry, I could not generate a reply right now.";

    } catch (err) {
        console.log(err);
        return "Sorry, something went wrong while talking to the AI.";
    }
};

export default getGroqResponse;
