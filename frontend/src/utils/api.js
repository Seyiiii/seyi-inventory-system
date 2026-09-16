/**
 * Centralized API request helper to ensure consistent error handling,
 * specifically for rate limiting (429) and network errors.
 */
export async function apiRequest(url, options = {}) {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;

        const headers = {
            ...options.headers,
        };

        if (token && !headers.Authorization) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            // Handle Rate Limiting specifically
            if (response.status === 429) {
                const message = data.message || "Too many requests. Please slow down and try again later.";
                const error = new Error(message);
                error.status = 429;
                throw error;
            }

            // Handle other error statuses
            const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return data;
    } catch (error) {
        // Handle Network errors (TypeError: Failed to fetch)
        if (error instanceof TypeError) {
            throw new Error("Network error - please check your internet connection.");
        }
        throw error;
    }
}
