import { createContext, useState, useContext, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [userInfo, setUserInfo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('userInfo')) || null;
        } catch {
            return null;
        }
    });

    const [cartCount, setCartCount] = useState(0); // 👈 ADD

    // Fetch cart count from backend — callable from anywhere
    const refreshCartCount = useCallback(async (user) => {
        const activeUser = user || userInfo;
        if (!activeUser?.token) { setCartCount(0); return; }
        try {
            const res = await fetch('https://seyi-inventory.onrender.com/api/cart', {
                headers: { Authorization: `Bearer ${activeUser.token}` }
            });
            const data = await res.json();
            setCartCount(data.cart?.items?.length || 0);
        } catch {
            setCartCount(0);
        }
    }, [userInfo]);

    const login = (userData) => {
        setUserInfo(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        refreshCartCount(userData); // 👈 fetch count right on login
    };

    const logout = () => {
        setUserInfo(null);
        setCartCount(0); // 👈 clear count on logout
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout, cartCount, refreshCartCount }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}