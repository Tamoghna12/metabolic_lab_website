import { useState, useMemo } from 'preact/hooks';

export default function PublicationList({ initialPublications }) {
    const [selectedYear, setSelectedYear] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedAbstract, setExpandedAbstract] = useState(null);

    const years = useMemo(() =>
        [...new Set(initialPublications.map(p => p.data.year))].sort((a, b) => b - a),
        [initialPublications]
    );

    const filteredPublications = useMemo(() => {
        let filtered = initialPublications;

        if (selectedYear !== 'all') {
            filtered = filtered.filter(p => p.data.year === parseInt(selectedYear));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.data.title.toLowerCase().includes(query) ||
                p.data.authors.toLowerCase().includes(query) ||
                p.data.venue.toLowerCase().includes(query) ||
                (p.data.abstract && p.data.abstract.toLowerCase().includes(query))
            );
        }

        return filtered;
    }, [initialPublications, selectedYear, searchQuery]);

    const handleCopyBibTeX = (pub) => {
        const bibtex = `@article{${pub.data.authors.split(',')[0]?.trim().split(' ').pop()?.toLowerCase() || 'author'}${pub.data.year},
  title={${pub.data.title}},
  author={${pub.data.authors}},
  journal={${pub.data.venue}},
  year={${pub.data.year}},
  doi={${pub.data.doi || ''}}
}`;
        navigator.clipboard.writeText(bibtex).then(() => {
            // Could show a toast notification here
        });
    };

    return (
        <div class="flex flex-col lg:flex-row gap-10">
            {/* Sidebar for Filters */}
            <aside class="lg:w-72 flex-shrink-0">
                <div class="sticky top-28 space-y-6">
                    {/* Search */}
                    <div class="card-surface p-5">
                        <label class="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-3 block">Search</label>
                        <div class="relative">
                            <input
                                type="text"
                                placeholder="Title, author, venue..."
                                value={searchQuery}
                                onInput={(e) => setSearchQuery(e.target.value)}
                                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface-alt text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>

                    {/* Year Filter */}
                    <div class="card-surface p-5">
                        <h3 class="text-sm font-bold uppercase tracking-wider text-text-tertiary mb-4">Filter by Year</h3>
                        <div class="flex flex-col gap-1.5">
                            <button
                                class={`text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${selectedYear === 'all' ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-surface-alt text-text-secondary'}`}
                                onClick={() => setSelectedYear('all')}
                            >
                                All ({initialPublications.length})
                            </button>
                            {years.map(year => {
                                const count = initialPublications.filter(p => p.data.year === year).length;
                                return (
                                    <button
                                        key={year}
                                        class={`text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${selectedYear === year.toString() ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-surface-alt text-text-secondary'}`}
                                        onClick={() => setSelectedYear(year.toString())}
                                    >
                                        <span class="flex justify-between items-center">
                                            <span>{year}</span>
                                            <span class="text-xs opacity-60">{count}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div class="text-center text-sm text-text-tertiary">
                        Showing <span class="font-bold text-text">{filteredPublications.length}</span> of {initialPublications.length} publications
                    </div>
                </div>
            </aside>

            {/* Main List */}
            <div class="flex-grow">
                {filteredPublications.length === 0 ? (
                    <div class="text-center py-20">
                        <div class="text-5xl mb-4">🔍</div>
                        <h3 class="text-xl font-bold mb-2">No publications found</h3>
                        <p class="text-text-secondary">Try adjusting your search or filter criteria.</p>
                    </div>
                ) : (
                    <div class="space-y-6">
                        {filteredPublications.map((pub, index) => (
                            <article
                                key={pub.id}
                                class="publication-card card-surface p-8 transition-all hover:-translate-y-1 hover:shadow-lg border-l-4 border-l-transparent hover:border-l-primary reveal"
                                style={`animation-delay: ${index * 80}ms`}
                                data-pagefind-body
                            >
                                <div class="flex justify-between items-start gap-4 mb-4">
                                    <h4 class="publication-title font-bold text-xl leading-snug">{pub.data.title}</h4>
                                    <span class="flex-shrink-0 bg-accent/10 text-accent font-bold px-3 py-1 rounded-full text-sm">{pub.data.year}</span>
                                </div>
                                <p class="publication-authors text-text-secondary italic mb-4 leading-relaxed">{pub.data.authors}</p>

                                <div class="publication-venue flex items-center gap-2 text-primary font-medium mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                    </svg>
                                    {pub.data.venue}
                                </div>

                                {pub.data.abstract && (
                                    <div class="abstract-section mb-6">
                                        <button
                                            onClick={() => setExpandedAbstract(expandedAbstract === pub.id ? null : pub.id)}
                                            class="w-full text-left text-text-secondary text-sm transition-all cursor-pointer p-4 rounded-lg bg-surface-alt hover:bg-surface-muted"
                                        >
                                            <span class="font-bold text-text block mb-1">Abstract</span>
                                            <span class={expandedAbstract === pub.id ? '' : 'line-clamp-2'}>
                                                {pub.data.abstract}
                                            </span>
                                            <span class="text-primary text-xs font-semibold mt-2 inline-block">
                                                {expandedAbstract === pub.id ? 'Show less ↑' : 'Show more →'}
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {pub.data.tags && pub.data.tags.length > 0 && (
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        {pub.data.tags.map(tag => (
                                            <span key={tag} class="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div class="publication-actions flex flex-wrap gap-4 items-center pt-4 border-t border-border">
                                    {pub.data.doi && (
                                        <a
                                            href={`https://doi.org/${pub.data.doi}`}
                                            target="_blank"
                                            rel="noopener"
                                            class="text-sm font-medium flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                            </svg>
                                            View DOI
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleCopyBibTeX(pub)}
                                        class="text-sm font-medium flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy BibTeX
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
