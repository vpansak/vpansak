import { basicAuth, razorpayConfig } from "../../../../lib/payment";

export async function POST(request:Request){
 try{const body=await request.json() as Record<string,unknown>;const amount=Math.round(Number(body.amount));const name=String(body.name||"").trim();const email=String(body.email||"").trim();const mobile=String(body.mobile||"").trim();
 if(!name||!/^\S+@\S+\.\S+$/.test(email)||!/^[6-9]\d{9}$/.test(mobile)||!amount||amount<1||amount>1000000)return Response.json({error:"Valid donor details aur amount enter karein."},{status:400});
 const {keyId,keySecret}=await razorpayConfig();const donationId=`VPD${Math.floor(100000+Math.random()*900000)}`;const certificateId=`VPC${Math.floor(100000+Math.random()*900000)}`;
 const response=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{authorization:basicAuth(keyId,keySecret),"content-type":"application/json"},body:JSON.stringify({amount:amount*100,currency:"INR",receipt:donationId,notes:{purpose:"VPANSAK Support Fund",certificate_id:certificateId}})});const order=await response.json() as {id?:string;amount?:number;currency?:string;error?:{description?:string}};
 if(!response.ok||!order.id)return Response.json({error:order.error?.description||"Payment start nahi ho saka."},{status:502});return Response.json({keyId,donationId,certificateId,order:{id:order.id,amount:order.amount,currency:order.currency}})
 }catch(error){
  const message=error instanceof Error?error.message:"";
  if(message==="PAYMENT_NOT_CONFIGURED")return Response.json({error:"Razorpay live key Vercel Environment Variables me set nahi hai. RAZORPAY_KEY_SECRET add karke redeploy karein."},{status:503});
  return Response.json({error:"Online contribution abhi available nahi hai. Razorpay keys aur deployment logs check karein."},{status:503})
 }
}
