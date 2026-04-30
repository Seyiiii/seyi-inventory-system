import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  // --- 1. STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  // --- 2. FETCH RECOMMENDATIONS (Runs once) ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favCategories')) || [];
        const topFav = favorites.length > 0 ? favorites[0] : '';
        
        const response = await fetch(`https://seyi-inventory.onrender.com/api/products/recommended?category=${topFav}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        
        const data = await response.json();
        setRecommended(data);
      } catch (error) {
        console.error("Recommendation Error:", error);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  // --- 3. FETCH MAIN INVENTORY (Runs when page changes) ---
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://seyi-inventory.onrender.com/api/products?page=${currentPage}&limit=20`);
        if (!response.ok) throw new Error('Failed to fetch main inventory');
        
        const data = await response.json();
        setProducts(data.products || []); 
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Inventory Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [currentPage]);

  // --- 4. HELPER FUNCTIONS ---
  const getCategoryName = (p) => {
    if (!p.category_id) return 'Uncategorized';
    if (typeof p.category_id === 'object') return p.category_id.name || 'Uncategorized';
    return p.category_id;
  };

  const categories = [
    "All",
    ...new Set(products.map(getCategoryName))
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => getCategoryName(p) === selectedCategory);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // --- 5. THE UI (RENDER) ---
  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-4">
      
      {/* --- LEFT SIDEBAR: CATEGORIES --- */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div className="p-4 bg-gray-900 text-white font-bold tracking-wider text-sm uppercase">
            Categories
          </div>
          <div className="p-2 flex flex-col gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- RIGHT SIDE: CONTENT AREA --- */}
      <div className="flex-1 flex flex-col">
        
        {/* RECOMMENDED BANNER */}
        {!recLoading && recommended.length > 0 && (
          <div className="mb-10 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-extrabold text-blue-900 mb-4 flex items-center gap-2">
               ✨ Recommended For You
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommended.map(product => (
                <Link to={`/product/${product._id}`} key={`rec-${product._id}`}>
                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition">
                    <p className="font-bold text-sm text-gray-800 truncate">{product.name}</p>
                    <p className="text-green-600 text-sm font-bold">NGN {product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* MAIN INVENTORY GRID */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Warehouse Inventory</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {filteredProducts.map((product) => (
                  <Link to={`/product/${product._id}`} key={product._id} className="group outline-none">
                    <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between cursor-pointer group-hover:-translate-y-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                        <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider">
                          {getCategoryName(product)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl text-green-600 font-extrabold mb-2">NGN {product.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="col-span-full text-center text-gray-500 py-12">No products found in this category.</p>
                )}
              </div>

              {/* PAGINATION BUTTONS */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-auto mb-8 border-t border-gray-100 pt-8">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;