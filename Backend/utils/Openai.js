import "dotenv/config";
const getOperAPIResponse = async(message)=>{
    const options={
    method:"POST",
    headers:{
        "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
     
      {
        role: "user",
        content: message
      } ]
   })
  };
    try{
     const response = await fetch("https://api.openai.com/v1/chat/completions",options);
const data= await response.json();
// res.send(data.choices[0].message.content);//reply
return res.send(data);
    }catch(err){
        console.log(err);

    }


}
export default  getOperAPIResponse;