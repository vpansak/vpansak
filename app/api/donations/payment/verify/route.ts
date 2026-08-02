import { getDb } from "../../../../../db";
import { donations } from "../../../../../db/schema";
import { basicAuth, razorpayConfig, validRazorpaySignature } from "../../../../lib/payment";

const appreciation=(name:string,amount:number)=>`With sincere appreciation, VPANSAK Support Foundation recognizes ${name} for contributing ₹${amount.toLocaleString("en-IN")}. Your support helps us continue responsible community initiatives and create meaningful opportunities.`;
export async function POST(request:Request){
 try{const body=await request.json() as Record<string,unknown>;const name=String(body.name||"").trim();const email=String(body.email||"").trim().toLowerCase();const mobile=String(body.mobile||"").trim();const amount=Math.round(Number(body.amount));const orderId=String(body.razorpay_order_id||"");const paymentId=String(body.razorpay_payment_id||"");const signature=String(body.razorpay_signature||"");const donationId=String(body.donationId||"");const certificateId=String(body.certificateId||"");
 if(!/^VPD\d{6}$/.test(donationId)||!/^VPC\d{6}$/.test(certificateId)||!/^order_[A-Za-z0-9]+$/.test(orderId)||!/^pay_[A-Za-z0-9]+$/.test(paymentId)||!/^[a-f0-9]{64}$/i.test(signature))return Response.json({error:"Invalid payment response."},{status:400});
 const {keyId,keySecret}=await razorpayConfig();if(!(await validRazorpaySignature(orderId,paymentId,signature,keySecret)))return Response.json({error:"Payment verification failed."},{status:400});
 const [or,pr]=await Promise.all([fetch(`https://api.razorpay.com/v1/orders/${orderId}`,{headers:{authorization:basicAuth(keyId,keySecret)}}),fetch(`https://api.razorpay.com/v1/payments/${paymentId}`,{headers:{authorization:basicAuth(keyId,keySecret)}})]);const go=await or.json() as {receipt?:string;amount?:number};const gp=await pr.json() as {order_id?:string;amount?:number;captured?:boolean;status?:string};
 if(!or.ok||!pr.ok||go.receipt!==donationId||go.amount!==amount*100||gp.order_id!==orderId||gp.amount!==amount*100||!(gp.captured||gp.status==="captured"))return Response.json({error:"Payment captured/verified nahi hua."},{status:400});
 const message=appreciation(name,amount);const db=await getDb();await db.insert(donations).values({donationId,donorName:name.slice(0,100),email:email.slice(0,150),mobile:mobile.slice(0,20),amount,paymentMethod:`Razorpay • ${paymentId}`.slice(0,30),paymentStatus:"Verified",certificateId,appreciationMessage:message});return Response.json({donationId,certificateId,donorName:name,amount,appreciationMessage:message,paymentStatus:"Verified"},{status:201})
 }catch{return Response.json({error:"Payment verify hua, lekin record save nahi ho saka. Payment ID support ko dein."},{status:500})}
}
