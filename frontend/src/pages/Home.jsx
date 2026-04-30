import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  // --- SEARCH STATE ---
  const [searchInput, setSearchInput] = useState('');   // what user is typing
  const [searchQuery, setSearchQuery] = useState('');   // what actually gets sent to backend

  // --- FETCH RECOMMENDATIONS ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favCategories')) || [];
        const topFav = favorites.length > 0 ? favorites[0] : '';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/recommended?category=${topFav}`);
        if (!response.ok) throw new Error('Failed');
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

  // --- FETCH MAIN INVENTORY ---
  // Reruns when page OR searchQuery changes
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      // Build URL — include search if there's a query
      const url = searchQuery
        ? `${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=20&search=${encodeURIComponent(searchQuery)}`
        : `${import.meta.env.VITE_API_URL}/api/products?page=${currentPage}&limit=20`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Inventory Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // --- SEARCH HANDLERS ---
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);           // reset to page 1 on new search
    setSelectedCategory('All'); // reset category filter
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedCategory('All');
  };

  // --- CATEGORY HELPERS ---
  const getCategoryName = (p) => {
    if (!p.category_id) return 'Uncategorized';
    if (typeof p.category_id === 'object') return p.category_id.name || 'Uncategorized';
    return p.category_id;
  };

  const categories = ['All', ...new Set(products.map(getCategoryName))];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => getCategoryName(p) === selectedCategory);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 mt-4">

      {/* LEFT SIDEBAR */}
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

      {/* RIGHT CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-800"
            />
            {/* Clear button — only shows when something is typed */}
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Search result label */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <p className="text-gray-600 text-sm">
              Showing results for <span className="font-bold text-gray-900">"{searchQuery}"</span>
            </p>
            <button
              onClick={handleClearSearch}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* RECOMMENDED BANNER — hide during search */}
        {!searchQuery && !recLoading && recommended.length > 0 && (
          <div className="mb-10 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-extrabold text-blue-900 mb-4">✨ Recommended For You</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommended.map(product => (
                <Link to={`/product/${product._id}`} key={`rec-${product._id}`}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                    {/* Recommended card image */}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-24 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-3xl">📦</div>
                    )}
                    <div className="p-3">
                      <p className="font-bold text-sm text-gray-800 truncate">{product.name}</p>
                      <p className="text-green-600 text-sm font-bold">NGN {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* MAIN INVENTORY GRID */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : 'Warehouse Inventory'}
            </h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} products</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {filteredProducts.map((product) => (
                  <Link to={`/product/${product._id}`} key={product._id} className="group outline-none">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer group-hover:-translate-y-1 overflow-hidden">
                      
                      {/* PRODUCT IMAGE */}
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      {/* Fallback if no image or image fails to load */}
                      <div
                        className="w-full h-48 bg-gray-100 items-center justify-center text-5xl"
                        style={{ display: product.image ? 'none' : 'flex' }}
                      >
                        📦
                      </div>

                      {/* PRODUCT INFO */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                            {getCategoryName(product)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xl text-green-600 font-extrabold mb-1">
                            NGN {product.price.toLocaleString()}
                          </p>
                          <p className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </Link>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? `No products found for "${searchQuery}"` : 'No products in this category.'}
                    </p>
                    {searchQuery && (
                      <button onClick={handleClearSearch} className="mt-4 text-blue-600 hover:underline text-sm">
                        Clear search and browse all
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
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
                  <span className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
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