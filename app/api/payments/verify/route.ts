import { getDb } from "../../../../db";
import { notifications, orderItems, orders } from "../../../../db/schema";
import { basicAuth, calculateCheckout, razorpayConfig, validRazorpaySignature } from "../../../lib/payment";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const orderId=String(payload.razorpay_order_id||""); const paymentId=String(payload.razorpay_payment_id||""); const signature=String(payload.razorpay_signature||"");
    const vpOrderId=String(payload.vpOrderId||"").toUpperCase();
    if(!/^order_[A-Za-z0-9]+$/.test(orderId)||!/^pay_[A-Za-z0-9]+$/.test(paymentId)||!/^VPO\d{6}$/.test(vpOrderId)||!/^[a-f0-9]{64}$/i.test(signature)) return Response.json({error:"Invalid payment response."},{status:400});
    const checkout=await calculateCheckout(payload.items,payload.couponCode); const {keyId,keySecret}=await razorpayConfig();
    if(!(await validRazorpaySignature(orderId,paymentId,signature,keySecret))) return Response.json({error:"Payment verification failed."},{status:400});
    const [orderResponse,paymentResponse]=await Promise.all([
      fetch(`https://api.razorpay.com/v1/orders/${orderId}`,{headers:{authorization:basicAuth(keyId,keySecret)}}),
      fetch(`https://api.razorpay.com/v1/payments/${paymentId}`,{headers:{authorization:basicAuth(keyId,keySecret)}}),
    ]);
    const gatewayOrder=await orderResponse.json() as {amount?:number;currency?:string;receipt?:string}; const gatewayPayment=await paymentResponse.json() as {order_id?:string;amount?:number;currency?:string;status?:string;captured?:boolean};
    const expected=checkout.total*100;
    if(!orderResponse.ok||!paymentResponse.ok||gatewayOrder.receipt!==vpOrderId||gatewayOrder.amount!==expected||gatewayPayment.order_id!==orderId||gatewayPayment.amount!==expected||gatewayPayment.currency!=="INR"||!(gatewayPayment.captured||gatewayPayment.status==="captured")) return Response.json({error:"Payment abhi captured/verified nahi hua."},{status:400});
    const required=["customerName","mobile","address","city","pinCode"];
    if(required.some((key)=>!String(payload[key]||"").trim())) return Response.json({error:"Delivery details complete karein."},{status:400});
    const db=await getDb(); const ownerEmail=request.headers.get("oai-authenticated-user-email")?.toLowerCase()||null;
    const [saved]=await db.insert(orders).values({orderId:vpOrderId,ownerEmail,customerName:String(payload.customerName).trim().slice(0,100),mobile:String(payload.mobile).trim().slice(0,20),address:String(payload.address).trim().slice(0,300),city:String(payload.city).trim().slice(0,100),pinCode:String(payload.pinCode).trim().slice(0,12),paymentMethod:`Razorpay • ${paymentId}`.slice(0,50),total:checkout.total,status:"Order Confirmed"}).returning();
    await db.insert(orderItems).values(checkout.items.map((item)=>({...item,orderId:vpOrderId})));
    if(ownerEmail) await db.insert(notifications).values({ownerEmail,title:"Payment successful",message:`Payment received and order ${vpOrderId} confirmed.`,type:"order"});
    return Response.json({order:{orderId:saved.orderId,total:saved.total,status:saved.status,paymentMethod:saved.paymentMethod}});
  } catch { return Response.json({error:"Payment verify hua, lekin order save nahi ho saka. Support ko payment ID dein."},{status:500}); }
}
