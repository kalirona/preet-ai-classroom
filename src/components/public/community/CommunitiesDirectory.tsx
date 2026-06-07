import React, { useState } from "react";
import { Search, TrendingUp, Users, Sparkles } from "lucide-react";
import CommunityCard from "../shared/CommunityCard";

const allCommunities = [
  { name: "AI Builders Collective", description: "A community for AI enthusiasts, developers, and innovators to share knowledge and build together.", memberCount: 2847, courseCount: 12, slug: "ai-builders-collective", category: "Technology", trending: true },
  { name: "Design Masters", description: "Premium design community for UI/UX designers, brand strategists, and creative professionals.", memberCount: 1532, courseCount: 8, slug: "design-masters", category: "Design", trending: false },
  { name: "SaaS Founders Hub", description: "Connect with fellow SaaS founders. Share strategies, get feedback, and grow your startup.", memberCount: 3621, courseCount: 15, slug: "saas-founders-hub", category: "Business", trending: true },
  { name: "Data Science Circle", description: "Learn data science, machine learning, and analytics with hands-on projects and mentorship.", memberCount: 1987, courseCount: 10, slug: "data-science-circle", category: "Data Science", trending: false },
  { name: "Creative Writers Guild", description: "A supportive community for writers of all genres. Get feedback, find inspiration, and publish.", memberCount: 876, courseCount: 5, slug: "creative-writers-guild", category: "Writing", trending: false },
  { name: "Web3 Innovators", description: "Explore blockchain, DeFi, NFTs, and the decentralized web with fellow builders and investors.", memberCount: 1456, courseCount: 7, slug: "web3-innovators", category: "Technology", trending: true },
];

const categories = ["All", "Technology", "Design", "Business", "Data Science", "Writing"];

export default function CommunitiesDirectory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showTrending, setShowTrending] = useState(false);

  const filtered = allCommunities.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All" && c.category !== category) return false;
    if (showTrending && !c.trending) return false;
    return true;
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">Discover Communities</h1>
          <p className="text-gray-500">Find your people. Join communities that inspire you.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${category === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={() => setShowTrending(!showTrending)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${showTrending ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trending
          </button>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <CommunityCard key={c.slug} {...c} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No communities found</p>
            <button onClick={() => { setSearch(""); setCategory("All"); setShowTrending(false); }} className="text-sm font-medium text-gray-900 underline underline-offset-2">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
