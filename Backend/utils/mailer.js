import "dotenv/config";

const sendResetEmail = async (toEmail, resetLink) => {
    const options = {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
            from: "Prompt Verse <onboarding@resend.dev>",
            to: [toEmail],
            subject: "Reset your Prompt Verse password",
            html: `
                <p>Hey,</p>
                <p>Click the link below to reset your Prompt Verse password. This link expires in 30 minutes.</p>
                <p><a href="${resetLink}">${resetLink}</a></p>
                <p>If you didn't ask for this, just ignore this email.</p>
            `
        })
    };

    try{
        const response = await fetch("https://api.resend.com/emails", options);
        const data = await response.json();
        if(!response.ok){
            console.log("Resend error:", data);
            return false;
        }
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
};

export default sendResetEmail;
