import { NextResponse } from "next/server";
const required=["service","barber","date","time","name","phone"];
export async function POST(request:Request){const body=await request.json();if(required.some(k=>!body[k]))return NextResponse.json({error:"Please complete all required appointment details."},{status:400});if(!/^\d{4}-\d{2}-\d{2}$/.test(body.date)||!/^\d{2}:\d{2}$/.test(body.time))return NextResponse.json({error:"Invalid appointment time."},{status:400});
const reference=`2G-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
// Production path: invoke the Supabase RPC below with the authenticated server secret.
// The migration locks the barber's schedule and rejects an overlap atomically.
if(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY){const result=await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/create_appointment`,{method:"POST",headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({p_service_slug:body.service,p_barber_slug:body.barber,p_customer_name:body.name,p_customer_phone:body.phone,p_start_at:`${body.date}T${body.time}:00+03:00`,p_reference:reference})});if(!result.ok)return NextResponse.json({error:"That time has just been taken. Please select another."},{status:409});}
return NextResponse.json({reference},{status:201})}
