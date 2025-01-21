import { GenAiCode } from "@/configs/AiModel"
import { NextResponse } from "next/server"

export async function POST(req){
    const {prompt}=await req.json()
    try{
        const result = await GenAiCode.sendMessage(prompt)
        const response = await result.response.text()
        
        try {
            // Pastikan response adalah JSON yang valid
            const parsedResponse = JSON.parse(response)
            return NextResponse.json(parsedResponse)
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError)
            return NextResponse.json({
                error: "Invalid response format",
                details: response
            }, { status: 422 })
        }
    } catch(error) {
        console.error("AI Generation error:", error)
        return NextResponse.json({
            error: error.message || "Failed to generate code"
        }, { status: 500 })
    }
}
