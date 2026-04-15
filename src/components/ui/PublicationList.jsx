import { useState } from 'preact/hooks';

export default function PublicationList({ initialPublications }) {
    const years = [...new Set(initialPublications.map(p => p.data.year))].sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = useState('all');

    const filteredPublications = selectedYear === 'all' 
        ? initialPublications 
        : initialPublications.filter(p => p.data.year === parseInt(selectedYear));

    return (
        <div class="publications-container">
            <div class="filter-controls mb-8 flex flex-wrap gap-4 justify-center">
                <button 
                    class={`pill-button small ${selectedYear === 'all' ? 'primary' : 'secondary'}`}
                    onClick={() => setSelectedYear('all')}
                >
                    All Years
                </button>
                {years.map(year => (
                    <button 
                        key={year}
                        class={`pill-button small ${selectedYear === year.toString() ? 'primary' : 'secondary'}`}
                        onClick={() => setSelectedYear(year.toString())}
                    >
                        {year}
                    </button>
                ))}
            </div>

            <div class="publications-list card-surface p-8">
                <ul class="space-y-2">
                    {filteredPublications.map(pub => (
                        <li key={pub.id} class="publication-item border-b border-border py-6 last:border-0">
                            <h4 class="publication-title font-bold text-xl mb-2">{pub.data.title}</h4>
                            <p class="publication-authors text-gray-600 italic mb-3">{pub.data.authors}</p>
                            <div class="publication-meta flex flex-wrap gap-6 text-sm">
                                <span class="venue font-medium text-primary">{pub.data.venue}</span>
                                <span class="year font-bold px-3 py-1 bg-accent/10 text-accent rounded-full">{pub.data.year}</span>
                                {pub.data.doi && (
                                    <a href={`https://doi.org/${pub.data.doi}`} target="_blank" rel="noopener" class="doi flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                                        <span>🔗</span> DOI: {pub.data.doi}
                                    </a>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
