import { doc, getDoc, setDoc, Timestamp, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { UserProfile, PlanType, DEFAULT_ADMIN_UID } from "../types";

/**
 * Creates a new user document if it doesn't exist.
 * Handles the logic for assigning an upline_uid from referral.
 */
export const ensureUserDocument = async (
  uid: string, 
  email: string, 
  name: string, 
  photoURL: string,
  referralCode: string | null
): Promise<UserProfile> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }

  // Determine Upline: Use referral code if valid, otherwise default admin
  let uplineUid = DEFAULT_ADMIN_UID;
  
  if (referralCode && referralCode !== uid) {
    // Basic check to ensure referral ID isn't self (though DB constraints/logic usually handle this)
    // In a real app, you might want to verify the upline user exists here.
    uplineUid = referralCode;
  }

  const newUser: UserProfile = {
    uid,
    name,
    email,
    photoURL,
    upline_uid: uplineUid,
    is_active: false,
    plan_type: PlanType.FREE,
    total_balance: 0,
    createdAt: Timestamp.now()
  };

  await setDoc(userRef, newUser);
  return newUser;
};

/**
 * Real-time listener for the current user's profile
 */
export const subscribeToUserProfile = (uid: string, callback: (data: UserProfile | null) => void) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    } else {
      callback(null);
    }
  });
};

/**
 * Real-time listener for the user's commission history
 */
export const subscribeToCommissions = (uid: string, callback: (data: any[]) => void) => {
  const q = query(
    collection(db, "commissions"),
    where("recipient_uid", "==", uid),
    orderBy("timestamp", "desc"),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    const commissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(commissions);
  });
};