import { db } from "../../firebaseConfig"; // عدّل المسار حسب مكان firebaseConfig.js
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
    try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(products);
    } catch (err) {
        console.error("❌ Firestore connection failed:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
}