import { chatSession } from "@/configs/AiModel";
import { NextResponse } from "next/server";

export async function POST(req){
    const {prompt}=await req.json();

    try{
        const result = await chatSession.sendMessage(prompt);
        const AIResp = await result.response.text();
        
        // Gabungkan semua baris menjadi satu paragraf
        const cleanedResponse = AIResp
            .split('\n')
            .filter(line => line.trim() !== '')
            .join(' ');

        return NextResponse.json({
            result: cleanedResponse
        })
    }catch(e){
        return NextResponse.json({
            error: e.message
        })
    }
}